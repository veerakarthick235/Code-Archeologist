#!/bin/bash

echo "======================================"
echo "CodeArcheologist - Agent Testing"
echo "======================================"
echo ""

# Test 1: Create Project
echo "Test 1: Creating new project..."
PROJECT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Test Legacy PHP Migration",
    "legacyCode": "<?php\n$conn = mysql_connect(\"localhost\", \"root\", \"password\");\n$query = \"SELECT * FROM users WHERE id = \" . $_GET[\"id\"];\n$result = mysql_query($query);\n?>"
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Failed to create project"
  echo "Response: $PROJECT_RESPONSE"
  exit 1
else
  echo "✅ Project created successfully"
  echo "Project ID: $PROJECT_ID"
fi

echo ""
echo "Test 2: Running Archaeologist Agent..."
sleep 2

ANALYZE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects/$PROJECT_ID/analyze")
echo "Analysis Response: ${ANALYZE_RESPONSE:0:200}..."

echo ""
echo "Test 3: Running Architect Agent..."
sleep 2

DESIGN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects/$PROJECT_ID/design")
echo "Design Response: ${DESIGN_RESPONSE:0:200}..."

echo ""
echo "Test 4: Approving Blueprint..."
APPROVE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects/$PROJECT_ID/approve-blueprint" \
  -H "Content-Type: application/json" \
  -d '{"approved": true}')
echo "Approval Response: $APPROVE_RESPONSE"

echo ""
echo "Test 5: Running Builder Agent..."
BUILD_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/projects/$PROJECT_ID/build")
echo "Build Response: ${BUILD_RESPONSE:0:200}..."

echo ""
echo "Test 6: Getting final project state..."
FINAL_STATE=$(curl -s -X GET "http://localhost:3000/api/projects/$PROJECT_ID")
echo "Final State: ${FINAL_STATE:0:300}..."

echo ""
echo "======================================"
echo "Testing Complete!"
echo "======================================"
