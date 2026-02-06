'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Code2, 
  FileCode, 
  Sparkles, 
  Download, 
  Play, 
  CheckCircle2, 
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Loader2,
  GitBranch,
  Database,
  FileJson,
  Terminal,
  Eye
} from 'lucide-react'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap 
} from 'reactflow'
import 'reactflow/dist/style.css'

const SAMPLE_LEGACY_CODE = ""
export default function App() {
  const [projectName, setProjectName] = useState('')
  const [legacyCode, setLegacyCode] = useState(SAMPLE_LEGACY_CODE)
  const [projectId, setProjectId] = useState(null)
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('idle')
  const [logs, setLogs] = useState([])
  const [flowNodes, setFlowNodes] = useState([])
  const [flowEdges, setFlowEdges] = useState([])

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  // ================== DOWNLOAD HELPERS ==================
  const downloadFile = (content, filename, type = 'application/json') => {
    const blob = new Blob([type === 'application/json' ? JSON.stringify(content, null, 2) : content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadAudit = () => {
    if (currentProject?.auditReport) {
      downloadFile(currentProject.auditReport, `${currentProject.projectName}_Audit.json`)
    }
  }

  const downloadBlueprint = () => {
    if (currentProject?.blueprint?.blueprintMarkdown) {
      downloadFile(currentProject.blueprint.blueprintMarkdown, `${currentProject.projectName}_Blueprint.md`, 'text/markdown')
    }
  }

  const downloadCode = () => {
    if (currentProject?.generatedCode) {
      downloadFile(currentProject.generatedCode, `${currentProject.projectName}_Modern_Code.json`)
    }
  }
  // ======================================================

  const createProject = async () => {
    if (!projectName.trim() || !legacyCode.trim()) {
      addLog('Please provide project name and legacy code', 'error')
      return
    }

    setLoading(true)
    addLog('Creating new migration project...', 'info')
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, legacyCode })
      })
      
      const project = await response.json()
      setProjectId(project.id)
      setCurrentProject(project)
      addLog(`Project created: ${project.projectName}`, 'success')
      setCurrentPhase('created')
    } catch (error) {
      addLog(`Error creating project: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const runArchaeologist = async () => {
    if (!projectId) return
    
    setLoading(true)
    setCurrentPhase('analyzing')
    addLog('🔍 Archaeologist Agent: Starting legacy code analysis...', 'info')
    addLog('Parsing codebase with 2M+ token context window...', 'info')
    
    try {
      const response = await fetch(`/api/projects/${projectId}/analyze`, {
        method: 'POST'
      })
      
      const result = await response.json()
      setCurrentProject(prev => ({ ...prev, ...result }))
      
      // Create dependency graph
      if (result.auditReport?.dependencyGraph) {
        const nodes = result.auditReport.dependencyGraph.nodes.map((node, idx) => ({
          id: node.id,
          data: { label: node.label },
          position: { x: (idx % 4) * 250, y: Math.floor(idx / 4) * 150 },
          type: 'default'
        }))
        
        const edges = result.auditReport.dependencyGraph.edges.map((edge, idx) => ({
          id: `e${idx}`,
          source: edge.source,
          target: edge.target,
          label: edge.label
        }))
        
        setFlowNodes(nodes)
        setFlowEdges(edges)
      }
      
      addLog('✅ Analysis complete! Found ' + (result.auditReport?.securityIssues?.length || 0) + ' security issues', 'success')
      addLog('Code Quality Score: ' + (result.auditReport?.codeQualityScore || 0) + '/100', 'info')
      setCurrentPhase('analyzed')
    } catch (error) {
      addLog(`Error during analysis: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const runArchitect = async () => {
    if (!projectId) return
    
    setLoading(true)
    setCurrentPhase('designing')
    addLog('🏗️ Architect Agent: Starting deep reasoning...', 'info')
    addLog('Using Gemini Deep Thinking for architectural design...', 'info')
    
    try {
      const response = await fetch(`/api/projects/${projectId}/design`, {
        method: 'POST'
      })
      
      const result = await response.json()
      setCurrentProject(prev => ({ ...prev, ...result }))
      
      addLog('✅ Blueprint generated! Ready for human review', 'success')
      addLog('Architecture: ' + (result.blueprint?.architecturalDesign?.pattern || 'N/A'), 'info')
      setCurrentPhase('designed')
    } catch (error) {
      addLog(`Error during design: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const approveBlueprint = async () => {
    if (!projectId) return
    
    setLoading(true)
    addLog('✅ Blueprint approved by user', 'success')
    
    try {
      await fetch(`/api/projects/${projectId}/approve-blueprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      })
      
      setCurrentProject(prev => ({ ...prev, blueprintApproved: true }))
      setCurrentPhase('approved')
      addLog('Proceeding to code generation...', 'info')
    } catch (error) {
      addLog(`Error approving blueprint: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  const runBuilder = async () => {
    if (!projectId) return
    
    setLoading(true)
    setCurrentPhase('building')
    addLog('🔨 Builder Agent: Starting code generation...', 'info')
    addLog('Implementing with self-healing capabilities...', 'info')
    
    try {
      const response = await fetch(`/api/projects/${projectId}/build`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      // --- 🔧 FIX: Map 'codeOutput' to 'generatedCode' ---
      setCurrentProject(prev => ({ 
        ...prev, 
        ...result,
        generatedCode: result.codeOutput // <--- THIS LINE FIXES THE "0 FILES" ISSUE
      }))
      // ---------------------------------------------------
      
      // Add build iteration logs
      result.buildIterations?.forEach((iteration, idx) => {
        if (iteration.executionResult) {
          addLog(
            `Attempt ${iteration.attempt}: ${iteration.executionResult.success ? '✅ Success' : '❌ Failed'}`,
            iteration.executionResult.success ? 'success' : 'warning'
          )
        }
        if (iteration.action === 'fix_applied') {
          addLog(`🔧 Applied fixes: ${iteration.changes?.join(', ')}`, 'info')
        }
      })
      
      addLog(
        result.success ? '✅ Migration complete! All tests passed' : '⚠️ Build completed with issues',
        result.success ? 'success' : 'warning'
      )
      setCurrentPhase('complete')
    } catch (error) {
      addLog(`Error during build: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CodeArcheologist
                </h1>
                <p className="text-xs text-slate-400">Autonomous Legacy Migration System</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                <Sparkles className="w-3 h-3 mr-1" />
                Gemini 3 Powered
              </Badge>
              <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                Multi-Agent System
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="setup" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-900/50">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="blueprint">Blueprint</TabsTrigger>
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* SETUP TAB */}
          <TabsContent value="setup" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Project Setup</CardTitle>
                <CardDescription>Initialize your legacy code migration project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Project Name
                  </label>
                  <Input
                    placeholder="e.g., Legacy PHP E-commerce Migration"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="bg-slate-950/50 border-slate-700 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Legacy Code
                  </label>
                  <Textarea
                    placeholder="Paste your legacy code here..."
                    value={legacyCode}
                    onChange={(e) => setLegacyCode(e.target.value)}
                    className="bg-slate-950/50 border-slate-700 text-white font-mono text-sm min-h-[400px]"
                  />
                </div>

                <Button 
                  onClick={createProject}
                  disabled={loading || currentPhase !== 'idle'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>

                {projectId && (
                  <Alert className="bg-green-950/50 border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <AlertTitle className="text-green-400">Project Created!</AlertTitle>
                    <AlertDescription className="text-green-300">
                      Project ID: {projectId}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Live Terminal */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  Live Terminal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] bg-slate-950/80 rounded-lg p-4">
                  {logs.map((log, idx) => (
                    <div key={idx} className="mb-2 font-mono text-sm">
                      <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                      <span className={
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'warning' ? 'text-yellow-400' :
                        'text-slate-300'
                      }>
                        {log.message}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <p className="text-slate-500 text-center py-8">Waiting for actions...</p>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYSIS TAB */}
          <TabsContent value="analysis" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Phase 1: Archaeologist Agent</CardTitle>
                <CardDescription>
                  Deep analysis of legacy codebase using Gemini's 2M+ token context window
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={runArchaeologist}
                  disabled={loading || !projectId || currentPhase === 'idle'}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading && currentPhase === 'analyzing' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Code...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Start Analysis
                    </>
                  )}
                </Button>

                {currentProject?.auditReport && (
                  <>
                    <Alert className="bg-blue-950/50 border-blue-800">
                      <FileJson className="h-4 w-4 text-blue-400" />
                      <AlertTitle className="text-blue-400">Analysis Complete</AlertTitle>
                      <AlertDescription className="text-blue-300">
                        Generated comprehensive audit report with security findings
                        {currentProject.auditReport.mode === 'SIMULATED' && (
                          <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            DEMO MODE
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="bg-slate-950/50 border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-slate-300">Code Quality</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold text-white">
                            {currentProject.auditReport.codeQualityScore}/100
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-950/50 border-slate-700">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-slate-300">Security Issues</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold text-red-400">
                            {currentProject.auditReport.securityIssues?.length || 0}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Button
                      onClick={downloadAudit}
                      variant="outline"
                      className="w-full border-slate-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Audit Report (JSON)
                    </Button>

                    {/* Dependency Graph */}
                    {flowNodes.length > 0 && (
                      <Card className="bg-slate-950/50 border-slate-700">
                        <CardHeader>
                          <CardTitle className="text-sm text-slate-300">Dependency Graph</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[400px] bg-slate-900 rounded-lg">
                            <ReactFlow
                              nodes={flowNodes}
                              edges={flowEdges}
                              fitView
                            >
                              <Background color="#334155" gap={16} />
                              <Controls />
                              <MiniMap nodeColor="#3b82f6" />
                            </ReactFlow>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BLUEPRINT TAB */}
          <TabsContent value="blueprint" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Phase 2: Architect Agent</CardTitle>
                <CardDescription>
                  Deep reasoning to design modern architecture with thought signatures
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={runArchitect}
                  disabled={loading || !currentProject?.auditReport || currentPhase === 'idle'}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {loading && currentPhase === 'designing' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Designing Architecture...
                    </>
                  ) : (
                    <>
                      <GitBranch className="w-4 h-4 mr-2" />
                      Generate Blueprint
                    </>
                  )}
                </Button>

                {currentProject?.blueprint && (
                  <>
                    <Alert className="bg-purple-950/50 border-purple-800">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <AlertTitle className="text-purple-400">Blueprint Generated</AlertTitle>
                      <AlertDescription className="text-purple-300">
                        Modern architecture designed with deep reasoning
                      </AlertDescription>
                    </Alert>

                    <Card className="bg-slate-950/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-sm text-slate-300">Target Stack</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p className="text-slate-400">
                            <span className="font-semibold text-white">Backend:</span>{' '}
                            {currentProject.blueprint.targetStack?.backend}
                          </p>
                          <p className="text-slate-400">
                            <span className="font-semibold text-white">Frontend:</span>{' '}
                            {currentProject.blueprint.targetStack?.frontend}
                          </p>
                          <p className="text-slate-400">
                            <span className="font-semibold text-white">Database:</span>{' '}
                            {currentProject.blueprint.targetStack?.database}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Separator className="bg-slate-700" />

                    {!currentProject.blueprintApproved && (
                      <Alert className="bg-yellow-950/50 border-yellow-800">
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                        <AlertTitle className="text-yellow-400">Human Review Required</AlertTitle>
                        <AlertDescription className="text-yellow-300">
                          Review the blueprint and approve to proceed with code generation
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-3">
                      <Button
                        onClick={downloadBlueprint}
                        variant="outline"
                        className="flex-1 border-slate-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Blueprint (MD)
                      </Button>

                      {!currentProject.blueprintApproved && (
                        <Button
                          onClick={approveBlueprint}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve Blueprint
                        </Button>
                      )}
                    </div>

                    {currentProject.blueprintApproved && (
                      <Alert className="bg-green-950/50 border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <AlertTitle className="text-green-400">Blueprint Approved</AlertTitle>
                        <AlertDescription className="text-green-300">
                          Ready for code generation
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BUILD TAB */}
          <TabsContent value="build" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Phase 3: Builder Agent</CardTitle>
                <CardDescription>
                  Self-healing code generation with automated testing and fixes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={runBuilder}
                  disabled={loading || !currentProject?.blueprintApproved}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading && currentPhase === 'building' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Building Code...
                    </>
                  ) : (
                    <>
                      <FileCode className="w-4 h-4 mr-2" />
                      Start Code Generation
                    </>
                  )}
                </Button>

                {currentProject?.buildIterations && currentProject.buildIterations.length > 0 && (
                  <>
                    <Alert className={
                      currentProject.success 
                        ? "bg-green-950/50 border-green-800"
                        : "bg-yellow-950/50 border-yellow-800"
                    }>
                      {currentProject.success ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <AlertTitle className="text-green-400">Build Successful!</AlertTitle>
                          <AlertDescription className="text-green-300">
                            Code generated and all tests passed
                          </AlertDescription>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-400" />
                          <AlertTitle className="text-yellow-400">Build Completed</AlertTitle>
                          <AlertDescription className="text-yellow-300">
                            Some tests may require manual review
                          </AlertDescription>
                        </>
                      )}
                    </Alert>

                    <Card className="bg-slate-950/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-sm text-slate-300">Build Iterations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {currentProject.buildIterations.map((iter, idx) => (
                            <div key={idx} className="text-sm">
                              {iter.executionResult && (
                                <div className="flex items-center gap-2">
                                  {iter.executionResult.success ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className="text-slate-300">
                                    Attempt {iter.attempt}: {iter.executionResult.success ? 'Success' : 'Failed'}
                                  </span>
                                  <span className="text-slate-500 ml-auto text-xs">
                                    {iter.executionResult.executionTime?.toFixed(0)}ms
                                  </span>
                                </div>
                              )}
                              {iter.action === 'fix_applied' && (
                                <div className="ml-6 text-slate-400 text-xs mt-1">
                                  🔧 Applied fixes
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RESULTS TAB */}
          <TabsContent value="results" className="space-y-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  Migration Results
                </CardTitle>
                <CardDescription>
                  Download generated code, documentation, and artifacts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* CHECK: Only show results if the phase is complete or we have code */}
                {(currentPhase === 'complete' || currentProject?.generatedCode) ? (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    
                    {/* Success Banner */}
                    <Alert className="bg-blue-950/30 border-blue-800/50">
                      <CheckCircle className="h-4 w-4 text-blue-400" />
                      <AlertTitle className="text-blue-400">Migration Successful</AlertTitle>
                      <AlertDescription className="text-blue-300/80">
                        The legacy codebase has been successfully analyzed, re-architected, and rewritten.
                      </AlertDescription>
                    </Alert>

                    {/* Download Buttons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={downloadAudit}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-start gap-1 border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          <ShieldCheck className="w-4 h-4" />
                          Audit Report
                        </div>
                        <span className="text-xs text-slate-500 font-normal">Security & Dependency Analysis</span>
                      </Button>

                      <Button
                        onClick={downloadBlueprint}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-start gap-1 border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:text-purple-400 transition-colors"
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          <FileCode className="w-4 h-4" />
                          Blueprint
                        </div>
                        <span className="text-xs text-slate-500 font-normal">Architecture & Implementation Plan</span>
                      </Button>

                      <Button
                        onClick={downloadCode}
                        variant="outline"
                        className="h-auto py-4 flex flex-col items-start gap-1 border-blue-900/50 bg-blue-950/20 hover:bg-blue-900/40 hover:text-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 font-semibold">
                          <Download className="w-4 h-4" />
                          Source Code
                        </div>
                        <span className="text-xs text-slate-500 font-normal">Full Python/Next.js Repository</span>
                      </Button>
                    </div>

                    {/* Generated Files List */}
                    <Card className="bg-slate-950/30 border-slate-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-400 flex justify-between items-center">
                          <span>Generated Artifacts</span>
                          <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                            {currentProject?.generatedCode?.files?.length || 0} Files
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[250px] w-full rounded-md border border-slate-800 bg-slate-900/50 p-4">
                          <div className="space-y-3">
                            {currentProject.generatedCode?.files?.map((file, idx) => (
                              <div key={idx} className="flex items-start gap-3 group">
                                <div className="mt-1">
                                  <FileCode className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-mono text-slate-300 group-hover:text-blue-300 transition-colors">
                                    {file.path}
                                  </p>
                                  <p className="text-xs text-slate-600 line-clamp-1">
                                    {file.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-300">No Results Yet</h3>
                      <p className="text-sm text-slate-500 max-w-sm">
                        Complete the <strong>Build</strong> phase to generate the modern codebase and view the results here.
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      onClick={() => document.querySelector('[value="build"]').click()} // Quick hack to jump tabs
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Go to Build Tab
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
