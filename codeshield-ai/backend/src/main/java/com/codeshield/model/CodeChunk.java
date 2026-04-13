package com.codeshield.model;

public class CodeChunk {
    private final String code;
    private final int startLine;
    private final int endLine;
    private final int chunkNumber;
    private final int totalChunks;

    public CodeChunk(String code, int startLine, int endLine, int chunkNumber, int totalChunks) {
        this.code = code;
        this.startLine = startLine;
        this.endLine = endLine;
        this.chunkNumber = chunkNumber;
        this.totalChunks = totalChunks;
    }

    public String getCode() { return code; }
    public int getStartLine() { return startLine; }
    public int getEndLine() { return endLine; }
    public int getChunkNumber() { return chunkNumber; }
    public int getTotalChunks() { return totalChunks; }
}
