package com.codeshield.service;

import com.codeshield.model.CodeChunk;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CodeChunkService {

    private static final int MAX_LINES_PER_CHUNK = 200;
    private static final int MIN_LINES_PER_CHUNK = 30;
    private static final int CONTEXT_LINES = 10;

    /**
     * Universal chunking — works for ANY language.
     * Strategy: blank lines at zero indentation are natural boundaries
     * in every language (between functions, classes, imports, etc.)
     */
    public List<CodeChunk> chunkCode(String code, String language) {
        String[] lines = code.split("\n", -1);

        if (lines.length <= MAX_LINES_PER_CHUNK) {
            return List.of(new CodeChunk(code, 1, lines.length, 1, 1));
        }

        List<Integer> boundaries = findUniversalBoundaries(lines);
        List<int[]> ranges = groupIntoChunks(boundaries, lines.length);
        return buildChunks(lines, ranges);
    }

    // Works for all languages: blank line or zero-indent line after deeper code
    private List<Integer> findUniversalBoundaries(String[] lines) {
        List<Integer> boundaries = new ArrayList<>();
        boolean wasIndented = false;

        for (int i = 0; i < lines.length; i++) {
            String trimmed = lines[i].trim();

            // Blank line = always a candidate boundary
            if (trimmed.isEmpty()) {
                if (i > 0) boundaries.add(i);
                continue;
            }

            int indent = getIndent(lines[i]);

            // Line at column 0 after indented code = block boundary
            if (indent == 0 && wasIndented) {
                boundaries.add(i - 1);
            }

            wasIndented = indent > 0;
        }

        // Always include last line
        if (boundaries.isEmpty() || boundaries.get(boundaries.size() - 1) != lines.length - 1) {
            boundaries.add(lines.length - 1);
        }

        return boundaries;
    }

    private int getIndent(String line) {
        int count = 0;
        for (char c : line.toCharArray()) {
            if (c == ' ') count++;
            else if (c == '\t') count += 4;
            else break;
        }
        return count;
    }

    private List<int[]> groupIntoChunks(List<Integer> boundaries, int totalLines) {
        List<int[]> ranges = new ArrayList<>();
        int chunkStart = 0;
        int lastValidSplit = -1;

        if (boundaries.isEmpty()) {
            ranges.add(new int[]{0, totalLines});
            return ranges;
        }

        for (int i = 0; i < boundaries.size(); i++) {
            int boundaryEnd = boundaries.get(i) + 1;
            int chunkSize = boundaryEnd - chunkStart;

            if (chunkSize <= MAX_LINES_PER_CHUNK) {
                lastValidSplit = i;
            } else {
                if (lastValidSplit != -1) {
                    int splitLine = boundaries.get(lastValidSplit) + 1;
                    ranges.add(new int[]{chunkStart, splitLine});
                    chunkStart = splitLine;
                    lastValidSplit = -1;
                    i--;
                } else {
                    // Force split to make progress
                    ranges.add(new int[]{chunkStart, boundaryEnd});
                    chunkStart = boundaryEnd;
                }
            }
        }

        if (chunkStart < totalLines) {
            ranges.add(new int[]{chunkStart, totalLines});
        }

        // Merge tiny trailing chunk
        if (ranges.size() > 1) {
            int[] last = ranges.get(ranges.size() - 1);
            if ((last[1] - last[0]) < MIN_LINES_PER_CHUNK) {
                ranges.remove(ranges.size() - 1);
                ranges.get(ranges.size() - 1)[1] = last[1];
            }
        }

        return ranges;
    }

    private List<CodeChunk> buildChunks(String[] lines, List<int[]> ranges) {
        List<CodeChunk> chunks = new ArrayList<>();

        for (int ci = 0; ci < ranges.size(); ci++) {
            int codeStart = ranges.get(ci)[0];
            int codeEnd = ranges.get(ci)[1];
            int contextStart = (ci == 0) ? codeStart : Math.max(0, codeStart - CONTEXT_LINES);

            StringBuilder sb = new StringBuilder();

            // Context lines from previous chunk (raw, no comment prefix — Gemini handles it)
            if (contextStart < codeStart) {
                sb.append("/* CONTEXT from previous chunk — do NOT report issues here */\n");
                for (int i = contextStart; i < codeStart; i++) {
                    sb.append(lines[i]).append("\n");
                }
                sb.append("/* END CONTEXT — analyze below (lines start at ").append(codeStart + 1).append(") */\n\n");
            }

            for (int i = codeStart; i < codeEnd; i++) {
                sb.append(lines[i]);
                if (i < codeEnd - 1) sb.append("\n");
            }

            chunks.add(new CodeChunk(sb.toString(), codeStart + 1, codeEnd, ci + 1, ranges.size()));
        }

        return chunks;
    }

}
