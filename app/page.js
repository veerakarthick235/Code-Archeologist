'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import ReactFlow, { 
  Controls, 
  Background, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Search, 
  FileCode, 
  Cpu, 
  Hammer, 
  Download, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Loader2,
  ChevronRight,
  Code2,
  Shield,
  GitBranch,
  Terminal,
  ArrowRight,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Save,
  X,
  RefreshCw
} from 'lucide-react'

// Phase indicator component
const PhaseIndicator = ({ phase, currentPhase }) => {
  const phases = [
    { id: 'archaeologist', label: 'Archaeologist', icon: Search, description: 'Analyzing legacy code' },
    { id: 'architect', label: 'Architect', icon: Cpu, description: 'Designing blueprint' },
    { id: 'builder', label: 'Builder', icon: Hammer, description: 'Generating code' }
  ]
  
  const getPhaseStatus = (phaseId) => {
    const phaseOrder = ['pending', 'archaeologist', 'archaeologist_complete', 'architect', 'architect_complete', 'blueprint_approved', 'builder', 'builder_complete']
    const currentIdx = phaseOrder.indexOf(currentPhase)
    
    if (phaseId === 'archaeologist') {
      if (currentIdx >= phaseOrder.indexOf('archaeologist_complete')) return 'complete'
      if (currentPhase === 'archaeologist') return 'active'
    }
    if (phaseId === 'architect') {
      if (currentIdx >= phaseOrder.indexOf('blueprint_approved')) return 'complete'
      if (currentPhase === 'architect' || currentPhase === 'architect_complete') return 'active'
    }
    if (phaseId === 'builder') {
      if (currentPhase === 'builder_complete') return 'complete'
      if (currentPhase === 'builder') return 'active'
    }
    return 'pending'
  }
  
  return (
    <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800">
      {phases.map((p, idx) => {
        const status = getPhaseStatus(p.id)
        const Icon = p.icon
        return (
          <div key={p.id} className="flex items-center">
            <div className={`flex flex-col items-center ${
              status === 'complete' ? 'text-green-400' :
              status === 'active' ? 'text-blue-400' : 'text-slate-600'
            }`}>
              <div className={`p-3 rounded-full mb-2 ${
                status === 'complete' ? 'bg-green-400/20 glow-green' :
                status === 'active' ? 'bg-blue-400/20 glow-blue animate-pulse' : 'bg-slate-800'
              }`}>
                {status === 'complete' ? <CheckCircle size={24} /> :
                 status === 'active' ? <Loader2 size={24} className="animate-spin" /> :
                 <Icon size={24} />}
              </div>
              <span className="font-medium text-sm">{p.label}</span>
              <span className="text-xs text-slate-500">{p.description}</span>
            </div>
            {idx < phases.length - 1 && (
              <ArrowRight className={`mx-6 ${
                getPhaseStatus(phases[idx + 1].id) !== 'pending' ? 'text-green-400' : 'text-slate-700'
              }`} size={20} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// Dependency Graph Visualization
const DependencyGraph = ({ graphData }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  useEffect(() => {
    if (!graphData?.nodes) return
    
    const nodeTypes = {
      'function': '#3b82f6',
      'class': '#8b5cf6',
      'module': '#10b981',
      'external': '#f59e0b'
    }
    
    const flowNodes = graphData.nodes.map((node, idx) => ({
      id: node.id,
      data: { label: node.label },
      position: { 
        x: (idx % 4) * 200 + 50, 
        y: Math.floor(idx / 4) * 100 + 50 
      },
      style: {
        background: nodeTypes[node.type] || '#64748b',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '500',
        border: 'none',
        boxShadow: `0 0 10px ${nodeTypes[node.type] || '#64748b'}40`
      }
    }))
    
    const flowEdges = (graphData.edges || []).map((edge, idx) => ({
      id: `e${idx}`,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      animated: true,
      style: { stroke: '#64748b' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' }
    }))
    
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [graphData, setNodes, setEdges])
  
  if (!graphData?.nodes?.length) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <GitBranch className="mr-2" /> No dependency graph available
      </div>
    )
  }
  
  return (
    <div className="h-80 bg-slate-950 rounded-lg border border-slate-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls className="bg-slate-800 border-slate-700" />
        <Background color="#334155" gap={16} />
        <MiniMap 
          nodeColor="#3b82f6"
          maskColor="rgba(15, 23, 42, 0.8)"
          className="bg-slate-900"
        />
      </ReactFlow>
    </div>
  )
}

// Terminal Output Component
const TerminalOutput = ({ logs }) => {
  return (
    <div className="bg-black rounded-lg border border-slate-800 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-sm text-slate-400">Build Terminal</span>
      </div>
      <div className="p-4 h-64 overflow-auto terminal-text text-sm">
        {logs.length === 0 ? (
          <span className="text-slate-600">Waiting for build process...</span>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className={`${
              log.includes('SUCCESS') || log.includes('passed') ? 'text-green-400' :
              log.includes('FAILED') || log.includes('Error') ? 'text-red-400' :
              log.includes('[SANDBOX]') ? 'text-yellow-400' :
              log.includes('[BUILDER]') ? 'text-blue-400' :
              'text-slate-300'
            }`}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Code Diff View
const CodeDiffView = ({ original, migrated }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
          <Code2 size={14} className="mr-2 text-red-400" /> Original (Legacy)
        </h4>
        <pre className="bg-slate-950 p-4 rounded-lg border border-red-900/30 text-sm overflow-auto max-h-96">
          <code className="text-red-300">{original || 'No original code'}</code>
        </pre>
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center">
          <Code2 size={14} className="mr-2 text-green-400" /> Migrated (Modern)
        </h4>
        <pre className="bg-slate-950 p-4 rounded-lg border border-green-900/30 text-sm overflow-auto max-h-96">
          <code className="text-green-300">{migrated || 'Migration pending...'}</code>
        </pre>
      </div>
    </div>
  )
}

// Security Issues Panel
const SecurityPanel = ({ issues }) => {
  if (!issues?.length) {
    return (
      <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm">
        <CheckCircle className="inline mr-2" size={16} />
        No security issues detected
      </div>
    )
  }
  
  return (
    <div className="space-y-2">
      {issues.map((issue, idx) => (
        <div key={idx} className={`p-3 rounded-lg border ${
          issue.severity === 'critical' ? 'bg-red-900/20 border-red-800' :
          issue.severity === 'high' ? 'bg-orange-900/20 border-orange-800' :
          issue.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-800' :
          'bg-blue-900/20 border-blue-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm flex items-center">
              <Shield size={14} className="mr-2" />
              {issue.type}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              issue.severity === 'critical' ? 'bg-red-600' :
              issue.severity === 'high' ? 'bg-orange-600' :
              issue.severity === 'medium' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}>
              {issue.severity}
            </span>
          </div>
          <p className="text-sm text-slate-400">{issue.description}</p>
          <p className="text-xs text-slate-500 mt-1">Location: {issue.location}</p>
        </div>
      ))}
    </div>
  )
}

// Blueprint Editor
const BlueprintEditor = ({ blueprint, onSave, onApprove }) => {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(blueprint?.content || '')
  
  useEffect(() => {
    setContent(blueprint?.content || '')
  }, [blueprint])
  
  if (!blueprint) return null
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <FileCode className="mr-2 text-purple-400" />
          Migration Blueprint
        </h3>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={() => { onSave(content); setEditing(false) }}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center"
              >
                <Save size={14} className="mr-1" /> Save
              </button>
              <button
                onClick={() => { setContent(blueprint.content); setEditing(false) }}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center"
              >
                <X size={14} className="mr-1" /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center"
              >
                <Edit3 size={14} className="mr-1" /> Edit
              </button>
              {!blueprint.approved && (
                <button
                  onClick={() => onApprove(content)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center"
                >
                  <CheckCircle size={14} className="mr-1" /> Approve Blueprint
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {blueprint.approved && (
        <div className="px-3 py-2 bg-green-900/30 border border-green-700 rounded-lg text-green-400 text-sm">
          <CheckCircle className="inline mr-2" size={14} />
          Blueprint approved - Ready for code generation
        </div>
      )}
      
      {editing ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 p-4 bg-slate-950 border border-slate-700 rounded-lg font-mono text-sm resize-none focus:outline-none focus:border-blue-500"
        />
      ) : (
        <div className="prose prose-invert prose-sm max-w-none bg-slate-900/50 p-6 rounded-lg border border-slate-800 max-h-96 overflow-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}

// Main App Component
export default function App() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [audit, setAudit] = useState(null)
  const [blueprint, setBlueprint] = useState(null)
  const [migration, setMigration] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [terminalLogs, setTerminalLogs] = useState([])
  
  // New project form
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    language: 'PHP',
    targetStack: 'Python/FastAPI',
    legacyCode: ''
  })
  
  // Sample legacy code examples
  const sampleCodes = {
    PHP: `<?php
// Legacy PHP e-commerce system
class ProductController {
    private $db;
    
    public function __construct() {
        $this->db = mysql_connect('localhost', 'root', 'password123');
        mysql_select_db('shop', $this->db);
    }
    
    public function getProduct($id) {
        // SQL Injection vulnerability!
        $query = "SELECT * FROM products WHERE id = " . $id;
        $result = mysql_query($query);
        return mysql_fetch_assoc($result);
    }
    
    public function calculateDiscount($price, $userType) {
        // Business rule: VIP gets 20%, regular gets 10%
        if ($userType == 'vip') {
            return $price * 0.8;
        } elseif ($userType == 'regular') {
            return $price * 0.9;
        }
        return $price;
    }
    
    public function processOrder($userId, $productId, $quantity) {
        $product = $this->getProduct($productId);
        // Hardcoded API key - security issue!
        $apiKey = 'sk_live_abc123xyz789';
        
        // Business rule: Max 10 items per order
        if ($quantity > 10) {
            die('Maximum 10 items per order');
        }
        
        $total = $product['price'] * $quantity;
        
        // Insert order - more SQL injection!
        $sql = "INSERT INTO orders VALUES (NULL, '$userId', '$productId', '$quantity', '$total')";
        mysql_query($sql);
        
        return array('success' => true, 'total' => $total);
    }
}
?>`,
    Python2: `#!/usr/bin/env python
# -*- coding: utf-8 -*-
# Legacy Python 2 inventory system

import MySQLdb
import pickle
import urllib2
from string import join

class InventoryManager:
    def __init__(self):
        # Hardcoded credentials - security issue!
        self.db = MySQLdb.connect(
            host='localhost',
            user='admin',
            passwd='admin123',
            db='inventory'
        )
        self.api_secret = 'secret_key_12345'
    
    def get_stock(self, product_id):
        # SQL injection vulnerability
        cursor = self.db.cursor()
        query = "SELECT * FROM stock WHERE product_id = %s" % product_id
        cursor.execute(query)
        return cursor.fetchone()
    
    def update_stock(self, product_id, quantity):
        # Business rule: Cannot have negative stock
        current = self.get_stock(product_id)
        if current[2] + quantity < 0:
            print "Error: Stock cannot be negative"
            return False
        
        # Business rule: Alert if stock below 10
        new_quantity = current[2] + quantity
        if new_quantity < 10:
            self.send_alert(product_id, new_quantity)
        
        cursor = self.db.cursor()
        cursor.execute(
            "UPDATE stock SET quantity = %d WHERE product_id = %s" 
            % (new_quantity, product_id)
        )
        return True
    
    def send_alert(self, product_id, quantity):
        # Using deprecated urllib2
        url = 'http://alerts.example.com/notify'
        data = pickle.dumps({'product': product_id, 'qty': quantity})
        req = urllib2.Request(url, data)
        urllib2.urlopen(req)
    
    def generate_report(self, items):
        # Using deprecated string.join
        header = join(['ID', 'Name', 'Qty', 'Price'], ',')
        rows = [header]
        for item in items:
            rows.append(join([str(x) for x in item], ','))
        return join(rows, '\n')

if __name__ == '__main__':
    manager = InventoryManager()
    print manager.get_stock(1)`,
    COBOL: `       IDENTIFICATION DIVISION.
       PROGRAM-ID. PAYROLL-CALC.
       AUTHOR. LEGACY-SYSTEM.
      *
      * PAYROLL CALCULATION SYSTEM - CIRCA 1985
      * BUSINESS RULES EMBEDDED IN CODE
      *
       DATA DIVISION.
       WORKING-STORAGE SECTION.
       01 WS-EMPLOYEE-REC.
          05 EMP-ID            PIC 9(6).
          05 EMP-NAME          PIC X(30).
          05 EMP-SALARY        PIC 9(7)V99.
          05 EMP-HOURS         PIC 9(3).
          05 EMP-TYPE          PIC X.
             88 FULL-TIME      VALUE 'F'.
             88 PART-TIME      VALUE 'P'.
             88 CONTRACTOR     VALUE 'C'.
       01 WS-CALCULATIONS.
          05 GROSS-PAY         PIC 9(9)V99.
          05 TAX-AMOUNT        PIC 9(7)V99.
          05 NET-PAY           PIC 9(9)V99.
          05 OVERTIME-PAY      PIC 9(7)V99.
      * HARDCODED TAX RATES - NEEDS UPDATE
       01 WS-TAX-RATES.
          05 FEDERAL-RATE      PIC V99 VALUE .22.
          05 STATE-RATE        PIC V99 VALUE .05.
          05 OVERTIME-RATE     PIC 9V9 VALUE 1.5.
       
       PROCEDURE DIVISION.
       MAIN-PROCESS.
           PERFORM CALCULATE-GROSS-PAY.
           PERFORM CALCULATE-TAXES.
           PERFORM CALCULATE-NET-PAY.
           STOP RUN.
       
       CALCULATE-GROSS-PAY.
      * BUSINESS RULE: OVERTIME AFTER 40 HOURS
           IF EMP-HOURS > 40
              COMPUTE OVERTIME-PAY = 
                 (EMP-HOURS - 40) * (EMP-SALARY / 2080) 
                 * OVERTIME-RATE
              COMPUTE GROSS-PAY = 
                 (40 * (EMP-SALARY / 2080)) + OVERTIME-PAY
           ELSE
              COMPUTE GROSS-PAY = 
                 EMP-HOURS * (EMP-SALARY / 2080)
           END-IF.
      * BUSINESS RULE: CONTRACTORS NO OVERTIME
           IF CONTRACTOR
              COMPUTE GROSS-PAY = 
                 EMP-HOURS * (EMP-SALARY / 2080)
           END-IF.
       
       CALCULATE-TAXES.
      * BUSINESS RULE: CONTRACTORS HANDLE OWN TAXES
           IF CONTRACTOR
              MOVE 0 TO TAX-AMOUNT
           ELSE
              COMPUTE TAX-AMOUNT = 
                 GROSS-PAY * (FEDERAL-RATE + STATE-RATE)
           END-IF.
       
       CALCULATE-NET-PAY.
           COMPUTE NET-PAY = GROSS-PAY - TAX-AMOUNT.`
  }
  
  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
    }
  }, [])
  
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])
  
  // Create new project
  const createProject = async () => {
    if (!newProject.legacyCode.trim()) {
      alert('Please enter legacy code to analyze')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })
      const project = await res.json()
      setProjects([project, ...projects])
      setSelectedProject(project)
      setShowNewProject(false)
      setNewProject({ name: '', language: 'PHP', targetStack: 'Python/FastAPI', legacyCode: '' })
      setAudit(null)
      setBlueprint(null)
      setMigration(null)
      setTerminalLogs([])
    } catch (err) {
      console.error('Failed to create project:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // Select project and load data
  const selectProject = async (project) => {
    setSelectedProject(project)
    setActiveTab('overview')
    setTerminalLogs([])
    
    // Load audit if exists
    try {
      const auditRes = await fetch(`/api/projects/${project.id}/audit`)
      if (auditRes.ok) {
        setAudit(await auditRes.json())
      } else {
        setAudit(null)
      }
    } catch { setAudit(null) }
    
    // Load blueprint if exists
    try {
      const bpRes = await fetch(`/api/projects/${project.id}/blueprint`)
      if (bpRes.ok) {
        setBlueprint(await bpRes.json())
      } else {
        setBlueprint(null)
      }
    } catch { setBlueprint(null) }
    
    // Load migration if exists
    try {
      const migRes = await fetch(`/api/projects/${project.id}/migration`)
      if (migRes.ok) {
        const migData = await migRes.json()
        setMigration(migData)
        setTerminalLogs(migData.buildLogs || [])
      } else {
        setMigration(null)
      }
    } catch { setMigration(null) }
  }
  
  // Run Archaeologist
  const runArchaeologist = async () => {
    if (!selectedProject) return
    setLoading(true)
    setTerminalLogs(['[ARCHAEOLOGIST] Starting legacy code analysis...'])
    
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/archaeologist`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (res.ok) {
        setAudit(data)
        setTerminalLogs(prev => [...prev, 
          '[ARCHAEOLOGIST] Analysis complete!',
          `[ARCHAEOLOGIST] Found ${data.businessRules?.length || 0} business rules`,
          `[ARCHAEOLOGIST] Found ${data.securityIssues?.length || 0} security issues`,
          `[ARCHAEOLOGIST] Identified ${data.dependencies?.length || 0} dependencies`
        ])
        // Refresh project status
        const projRes = await fetch(`/api/projects/${selectedProject.id}`)
        setSelectedProject(await projRes.json())
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, `[ERROR] ${err.message}`])
    } finally {
      setLoading(false)
    }
  }
  
  // Run Architect
  const runArchitect = async () => {
    if (!selectedProject) return
    setLoading(true)
    setTerminalLogs(prev => [...prev, '[ARCHITECT] Designing migration blueprint...'])
    
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/architect`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (res.ok) {
        setBlueprint({ content: data.blueprint, thoughtSignatures: data.thoughtSignatures, approved: false })
        setTerminalLogs(prev => [...prev, 
          '[ARCHITECT] Blueprint generated!',
          '[ARCHITECT] Awaiting human approval...'
        ])
        const projRes = await fetch(`/api/projects/${selectedProject.id}`)
        setSelectedProject(await projRes.json())
        setActiveTab('blueprint')
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, `[ERROR] ${err.message}`])
    } finally {
      setLoading(false)
    }
  }
  
  // Approve Blueprint
  const approveBlueprint = async (content) => {
    if (!selectedProject) return
    setLoading(true)
    
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/blueprint/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modifications: content !== blueprint?.content ? content : undefined })
      })
      
      if (res.ok) {
        setBlueprint({ ...blueprint, content, approved: true })
        setTerminalLogs(prev => [...prev, '[ARCHITECT] Blueprint approved!'])
        const projRes = await fetch(`/api/projects/${selectedProject.id}`)
        setSelectedProject(await projRes.json())
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, `[ERROR] ${err.message}`])
    } finally {
      setLoading(false)
    }
  }
  
  // Run Builder
  const runBuilder = async () => {
    if (!selectedProject) return
    setLoading(true)
    setTerminalLogs(prev => [...prev, '[BUILDER] Starting code generation...'])
    
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/builder`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (res.ok) {
        setTerminalLogs(prev => [...prev, ...data.buildLogs, 
          `[BUILDER] Generated ${data.filesGenerated} files`,
          '[BUILDER] Migration complete!'
        ])
        
        const migRes = await fetch(`/api/projects/${selectedProject.id}/migration`)
        setMigration(await migRes.json())
        
        const projRes = await fetch(`/api/projects/${selectedProject.id}`)
        setSelectedProject(await projRes.json())
        setActiveTab('code')
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      setTerminalLogs(prev => [...prev, `[ERROR] ${err.message}`])
    } finally {
      setLoading(false)
    }
  }
  
  // Download functions
  const downloadAudit = () => {
    if (!audit) return
    const blob = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `LegacyAudit_${selectedProject?.name || 'project'}.json`
    a.click()
  }
  
  const downloadBlueprint = () => {
    if (!blueprint) return
    const blob = new Blob([blueprint.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Blueprint_${selectedProject?.name || 'project'}.md`
    a.click()
  }
  
  const downloadMigration = () => {
    if (!migration?.files) return
    let content = '# Migrated Code\n\n'
    migration.files.forEach(f => {
      content += `## ${f.path}\n\n\`\`\`\n${f.content}\n\`\`\`\n\n`
    })
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MigratedCode_${selectedProject?.name || 'project'}.md`
    a.click()
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Search size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  CodeArcheologist
                </h1>
                <p className="text-xs text-slate-500">AI-Powered Legacy Migration</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewProject(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={18} /> New Migration
            </button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Projects List */}
          <aside className="col-span-3 space-y-4">
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
              <h2 className="font-semibold mb-4 flex items-center">
                <FileCode className="mr-2 text-blue-400" size={18} />
                Projects
              </h2>
              <div className="space-y-2">
                {projects.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No projects yet. Start a new migration!
                  </p>
                ) : (
                  projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => selectProject(project)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        selectedProject?.id === project.id
                          ? 'bg-blue-600/20 border border-blue-500/50'
                          : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-sm truncate">{project.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{project.language}</span>
                        <ChevronRight size={12} className="text-slate-600" />
                        <span className="text-xs text-slate-500">{project.targetStack}</span>
                      </div>
                      <div className={`text-xs mt-1 ${
                        project.status === 'completed' ? 'text-green-400' :
                        project.status === 'error' ? 'text-red-400' :
                        project.status === 'analyzing' || project.status === 'designing' || project.status === 'building' ? 'text-blue-400' :
                        'text-slate-500'
                      }`}>
                        {project.status}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="col-span-9 space-y-6">
            {!selectedProject ? (
              <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-12 text-center">
                <Search size={48} className="mx-auto mb-4 text-slate-600" />
                <h2 className="text-xl font-semibold mb-2">Welcome to CodeArcheologist</h2>
                <p className="text-slate-500 mb-6">Select a project or create a new migration to get started</p>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg inline-flex items-center gap-2"
                >
                  <Plus size={18} /> Start New Migration
                </button>
              </div>
            ) : (
              <>
                {/* Phase Progress */}
                <PhaseIndicator currentPhase={selectedProject.phase} />
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={runArchaeologist}
                    disabled={loading || (audit && selectedProject.phase !== 'pending')}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      !audit || selectedProject.phase === 'pending'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {loading && selectedProject.phase === 'archaeologist' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Search size={16} />
                    )}
                    {audit ? 'Re-analyze' : 'Run Archaeologist'}
                  </button>
                  
                  <button
                    onClick={runArchitect}
                    disabled={loading || !audit || blueprint}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      audit && !blueprint
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {loading && selectedProject.phase === 'architect' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Cpu size={16} />
                    )}
                    Run Architect
                  </button>
                  
                  <button
                    onClick={runBuilder}
                    disabled={loading || !blueprint?.approved}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      blueprint?.approved
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {loading && selectedProject.phase === 'builder' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Hammer size={16} />
                    )}
                    Run Builder
                  </button>
                  
                  <div className="flex-1" />
                  
                  {audit && (
                    <button onClick={downloadAudit} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2 text-sm">
                      <Download size={14} /> Audit JSON
                    </button>
                  )}
                  {blueprint && (
                    <button onClick={downloadBlueprint} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2 text-sm">
                      <Download size={14} /> Blueprint
                    </button>
                  )}
                  {migration && (
                    <button onClick={downloadMigration} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2 text-sm">
                      <Download size={14} /> Code
                    </button>
                  )}
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-slate-800">
                  {['overview', 'audit', 'blueprint', 'code', 'terminal'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-400'
                          : 'border-transparent text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                
                {/* Tab Content */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-3">Project Details</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-800/50 p-4 rounded-lg">
                            <div className="text-sm text-slate-500">Source Language</div>
                            <div className="text-lg font-medium">{selectedProject.language}</div>
                          </div>
                          <div className="bg-slate-800/50 p-4 rounded-lg">
                            <div className="text-sm text-slate-500">Target Stack</div>
                            <div className="text-lg font-medium">{selectedProject.targetStack}</div>
                          </div>
                          <div className="bg-slate-800/50 p-4 rounded-lg">
                            <div className="text-sm text-slate-500">Status</div>
                            <div className={`text-lg font-medium ${
                              selectedProject.status === 'completed' ? 'text-green-400' :
                              selectedProject.status === 'error' ? 'text-red-400' : 'text-blue-400'
                            }`}>{selectedProject.status}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Legacy Code</h3>
                        <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm overflow-auto max-h-64">
                          <code className="text-slate-300">{selectedProject.legacyCode}</code>
                        </pre>
                      </div>
                      
                      {audit && (
                        <div>
                          <h3 className="font-semibold mb-3">Quick Stats</h3>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-blue-400">{audit.summary?.totalLines || 0}</div>
                              <div className="text-sm text-slate-500">Lines of Code</div>
                            </div>
                            <div className="bg-purple-900/20 border border-purple-800 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-purple-400">{audit.businessRules?.length || 0}</div>
                              <div className="text-sm text-slate-500">Business Rules</div>
                            </div>
                            <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-red-400">{audit.securityIssues?.length || 0}</div>
                              <div className="text-sm text-slate-500">Security Issues</div>
                            </div>
                            <div className="bg-orange-900/20 border border-orange-800 p-4 rounded-lg text-center">
                              <div className="text-2xl font-bold text-orange-400">{audit.dependencies?.length || 0}</div>
                              <div className="text-sm text-slate-500">Dependencies</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'audit' && (
                    <div className="space-y-6">
                      {!audit ? (
                        <div className="text-center py-12 text-slate-500">
                          <Search size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Run the Archaeologist agent to analyze the legacy code</p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h3 className="font-semibold mb-3 flex items-center">
                              <GitBranch className="mr-2 text-blue-400" size={18} />
                              Dependency Graph
                            </h3>
                            <DependencyGraph graphData={audit.dependencyGraph} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <h3 className="font-semibold mb-3">Business Rules</h3>
                              <div className="space-y-2 max-h-64 overflow-auto">
                                {(audit.businessRules || []).map((rule, idx) => (
                                  <div key={idx} className="bg-slate-800/50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-mono text-xs text-blue-400">{rule.id}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded ${
                                        rule.criticality === 'high' ? 'bg-red-600' :
                                        rule.criticality === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                                      }`}>{rule.criticality}</span>
                                    </div>
                                    <p className="text-sm">{rule.description}</p>
                                    <p className="text-xs text-slate-500 mt-1">Location: {rule.location}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="font-semibold mb-3">Security Issues</h3>
                              <SecurityPanel issues={audit.securityIssues} />
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold mb-3">Dependencies</h3>
                            <div className="grid grid-cols-2 gap-3">
                              {(audit.dependencies || []).map((dep, idx) => (
                                <div key={idx} className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-sm">{dep.name}</div>
                                    <div className="text-xs text-slate-500">{dep.type} • v{dep.version || 'unknown'}</div>
                                  </div>
                                  <div className="text-right">
                                    <ArrowRight size={14} className="inline text-green-400 mr-1" />
                                    <span className="text-sm text-green-400">{dep.modernAlternative}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'blueprint' && (
                    <BlueprintEditor 
                      blueprint={blueprint}
                      onSave={(content) => setBlueprint({ ...blueprint, content })}
                      onApprove={approveBlueprint}
                    />
                  )}
                  
                  {activeTab === 'code' && (
                    <div className="space-y-6">
                      {!migration ? (
                        <div className="text-center py-12 text-slate-500">
                          <Hammer size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Run the Builder agent to generate migrated code</p>
                        </div>
                      ) : (
                        <>
                          <CodeDiffView 
                            original={selectedProject.legacyCode}
                            migrated={migration.files?.[0]?.content || ''}
                          />
                          
                          <div>
                            <h3 className="font-semibold mb-3">Generated Files</h3>
                            <div className="space-y-2">
                              {(migration.files || []).map((file, idx) => (
                                <details key={idx} className="bg-slate-800/50 rounded-lg">
                                  <summary className="p-3 cursor-pointer flex items-center justify-between">
                                    <span className="font-mono text-sm">{file.path}</span>
                                    <div className="flex items-center gap-2">
                                      {file.healed && (
                                        <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded">Self-healed</span>
                                      )}
                                      <span className="text-xs text-slate-500">{file.attempts} attempt(s)</span>
                                    </div>
                                  </summary>
                                  <pre className="p-4 border-t border-slate-700 text-sm overflow-auto max-h-64">
                                    <code className="text-green-300">{file.content}</code>
                                  </pre>
                                </details>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  
                  {activeTab === 'terminal' && (
                    <TerminalOutput logs={terminalLogs} />
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
      
      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold">New Migration Project</h2>
              <button onClick={() => setShowNewProject(false)} className="p-1 hover:bg-slate-800 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="My Legacy Migration"
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Source Language</label>
                  <select
                    value={newProject.language}
                    onChange={(e) => setNewProject({ ...newProject, language: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="PHP">PHP</option>
                    <option value="Python2">Python 2</option>
                    <option value="COBOL">COBOL</option>
                    <option value="Perl">Perl</option>
                    <option value="VB6">Visual Basic 6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Stack</label>
                  <select
                    value={newProject.targetStack}
                    onChange={(e) => setNewProject({ ...newProject, targetStack: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Python/FastAPI">Python / FastAPI</option>
                    <option value="Node/Express">Node.js / Express</option>
                    <option value="TypeScript/NestJS">TypeScript / NestJS</option>
                    <option value="Go/Gin">Go / Gin</option>
                    <option value="Java/Spring">Java / Spring Boot</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Legacy Code</label>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setNewProject({ ...newProject, legacyCode: sampleCodes.PHP, language: 'PHP' })}
                    className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
                  >
                    Load PHP Sample
                  </button>
                  <button
                    onClick={() => setNewProject({ ...newProject, legacyCode: sampleCodes.Python2, language: 'Python2' })}
                    className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
                  >
                    Load Python 2 Sample
                  </button>
                  <button
                    onClick={() => setNewProject({ ...newProject, legacyCode: sampleCodes.COBOL, language: 'COBOL' })}
                    className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
                  >
                    Load COBOL Sample
                  </button>
                </div>
                <textarea
                  value={newProject.legacyCode}
                  onChange={(e) => setNewProject({ ...newProject, legacyCode: e.target.value })}
                  placeholder="Paste your legacy code here..."
                  rows={12}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowNewProject(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={loading || !newProject.legacyCode.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
