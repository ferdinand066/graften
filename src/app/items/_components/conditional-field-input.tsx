"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import InputNumber from "@/components/ui/custom/input-number";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Hash,
  Folder,
  ChevronRight,
  ChevronDown,
  GripVertical,
  ArrowRight,
  Copy,
  RotateCcw
} from "lucide-react";
import { useState, useMemo } from "react";
import type { ConditionalFieldModel } from "schema/item.schema";
import { formatCurrency } from "@/lib/utils";

interface ConditionalFieldInputProps {
  field: {
    value: ConditionalFieldModel[] | null;
    onChange: (value: ConditionalFieldModel[] | null) => void;
  };
  label?: string;
}

export function ConditionalFieldInput({ field, label = "Conditional Fields" }: ConditionalFieldInputProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showBatchAdd, setShowBatchAdd] = useState<string | null>(null);
  const [batchAddText, setBatchAddText] = useState("");

  // Generate default names
  const generateDefaultName = (parentPath?: string, index?: number) => {
    const currentValue = field.value || [];
    const totalFields = currentValue.length;

    if (parentPath) {
      return `Child Field ${index !== undefined ? index + 1 : totalFields + 1}`;
    }
    return `Field ${totalFields + 1}`;
  };

  // Get breadcrumb path
  const getBreadcrumbs = (path: string) => {
    const pathParts = path.split('.');
    const currentValue = field.value || [];
    const breadcrumbs: string[] = [];

    let current = currentValue;
    for (let i = 0; i < pathParts.length; i++) {
      const index = parseInt(pathParts[i]!);
      const fieldData = current[index];
      if (fieldData) {
        breadcrumbs.push(fieldData.text || `Field ${index + 1}`);
        current = fieldData.children || [];
      }
    }

    return breadcrumbs;
  };

  // Toggle node expansion
  const toggleNodeExpansion = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  // Batch add children
  const handleBatchAdd = (parentPath: string) => {
    const names = batchAddText.split(',').map(name => name.trim()).filter(name => name);
    if (names.length === 0) return;

    const currentValue = field.value || [];
    const newValue = [...currentValue];
    let current = newValue;

    // Navigate to parent
    const pathParts = parentPath.split('.');
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (!part) continue;
      const index = parseInt(part);
      if (i === pathParts.length - 1) {
        // Add children to this parent
        if (!current[index]?.children) {
          current[index]!.children = [];
        }
        names.forEach(name => {
          current[index]!.children!.push({
            text: name,
            value: undefined,
            children: undefined,
          });
        });
      } else {
        current = current[index]!.children!;
      }
    }

    field.onChange(newValue);
    setShowBatchAdd(null);
    setBatchAddText("");
  };

  // Check if field is a value field (has been explicitly set as value type)
  const isValueField = (fieldData: ConditionalFieldModel) => {
    // A field is a value field if:
    // 1. It has a value (including 0)
    // 2. OR it has children === undefined (meaning it was set as value type)
    return fieldData.children === undefined;
  };

  // Check if field is a container field
  const isContainerField = (fieldData: ConditionalFieldModel) => {
    return fieldData.children !== undefined;
  };

  // Toggle field type
  const toggleFieldType = (path: string) => {
    const pathParts = path.split('.');
    const currentValue = field.value || [];
    const newValue = [...currentValue];

    let current = newValue;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!part) continue;
      const index = parseInt(part);
      current = current[index]!.children!;
    }

    const index = parseInt(pathParts[pathParts.length - 1]!);
    const fieldData = current[index]!;

    // Toggle between value and container
    if (isValueField(fieldData)) {
      // Switch to container
      current[index] = { ...fieldData, value: undefined, children: [] };
    } else {
      // Switch to value
      current[index] = { ...fieldData, value: 0, children: undefined };
    }

    field.onChange(newValue);
  };

  const addField = (parentPath?: string) => {
    const newField: ConditionalFieldModel = {
      text: generateDefaultName(parentPath),
      value: undefined,
      children: undefined,
    };

    const currentValue = field.value || [];

    if (parentPath) {
      // Add as child to existing field
      const pathParts = parentPath.split('.');
      const newValue = [...currentValue];
      let current = newValue;

      // Navigate to parent
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (!part) continue;
        const index = parseInt(part);
        if (i === pathParts.length - 1) {
          // Add to this parent
          if (!current[index]?.children) {
            current[index]!.children = [];
          }
          current[index]!.children!.push(newField);
        } else {
          current = current[index]!.children!;
        }
      }

      field.onChange(newValue);
    } else {
      // Add as root field
      field.onChange([...currentValue, newField]);
    }
  };

  const removeField = (path: string) => {
    const pathParts = path.split('.');
    const currentValue = field.value || [];
    const newValue = [...currentValue];

    if (pathParts.length === 1) {
      // Remove root field
      const index = parseInt(pathParts[0]!);
      newValue.splice(index, 1);
    } else {
      // Remove child field
      let current = newValue;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!part) continue;
        const index = parseInt(part);
        current = current[index]!.children!;
      }
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart) {
        current.splice(parseInt(lastPart), 1);
      }
    }

    field.onChange(newValue.length === 0 ? null : newValue);
  };

  const updateField = (path: string, updates: Partial<ConditionalFieldModel>) => {
    const pathParts = path.split('.');
    const currentValue = field.value || [];
    const newValue = [...currentValue];

    if (pathParts.length === 1) {
      // Update root field
      const index = parseInt(pathParts[0]!);
      newValue[index] = { ...newValue[index]!, ...updates };
    } else {
      // Update child field
      let current = newValue;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!part) continue;
        const index = parseInt(part);
        current = current[index]!.children!;
      }
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart) {
        const index = parseInt(lastPart);
        current[index] = { ...current[index]!, ...updates };
      }
    }

    field.onChange(newValue);
  };

  // Tree sidebar component
  const TreeSidebar = () => {
    const renderTreeNode = (fieldData: ConditionalFieldModel, path: string, depth = 0) => {
      const hasChildren = fieldData.children && fieldData.children.length > 0;
      const isExpanded = expandedNodes.has(path);
      const isSelected = selectedPath === path;
      const indentStyle = { marginLeft: `${depth * 16}px` };

      return (
        <div key={path}>
          <div
            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted/50 ${
              isSelected ? 'bg-muted border-l-2 border-primary' : ''
            }`}
            style={indentStyle}
            onClick={() => setSelectedPath(path)}
          >
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNodeExpansion(path);
                }}
                className="p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}

            <div className="flex items-center gap-2 flex-1 min-w-0">
              {isValueField(fieldData) ? (
                <Hash className="h-3 w-3 text-blue-500" />
              ) : isContainerField(fieldData) ? (
                <Folder className="h-3 w-3 text-orange-500" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-gray-300" />
              )}

              <span className="text-sm truncate">
                {fieldData.text || "Untitled Field"}
              </span>

              {isValueField(fieldData) && fieldData.value !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {formatCurrency(fieldData.value)}
                </Badge>
              )}
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div>
              {fieldData.children!.map((child, index) =>
                renderTreeNode(child, `${path}.${index}`, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="w-64 border-r bg-muted/20 p-4 overflow-y-auto">
        <div className="space-y-1">
          <div className="text-sm font-medium mb-3">Field Structure</div>
          {!field.value || field.value.length === 0 ? (
            <div className="text-sm text-muted-foreground py-4">
              No fields yet. Click "Add Field" to start.
            </div>
          ) : (
            field.value.map((fieldData, index) =>
              renderTreeNode(fieldData, index.toString())
            )
          )}
        </div>
      </div>
    );
  };

  // Get currently selected field data
  const getSelectedFieldData = () => {
    if (!selectedPath) return null;

    const pathParts = selectedPath.split('.');
    const currentValue = field.value || [];

    let current = currentValue;
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (!part) continue;
      const index = parseInt(part);
      if (i === pathParts.length - 1) {
        return current[index];
      } else {
        current = current[index]?.children || [];
      }
    }
    return null;
  };

  const selectedFieldData = getSelectedFieldData();

  const renderField = (fieldData: ConditionalFieldModel, path: string, depth = 0) => {
    const hasChildren = fieldData.children && fieldData.children.length > 0;

    return (
      <AccordionItem key={path} value={`field-${path}`} className="border rounded-lg px-4 mb-2 last:border-b-1">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center justify-between w-full">
            <div className="text-left">
              <div className="font-medium">
                {fieldData.text || "Untitled Field"}
              </div>
              <div className="text-sm text-muted-foreground">
                {fieldData.value !== undefined
                  ? `Value Field: ${fieldData.value}`
                  : hasChildren
                    ? `Container Field: ${fieldData.children!.length} child${fieldData.children!.length === 1 ? '' : 'ren'}`
                    : "Empty Field"
                }
              </div>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pt-4">
          <div className="space-y-4 mb-4">
            {/* Field Text - Always available */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="font-normal">Field Text *</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeField(path)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 h-8"
                >
                  <Trash2 className="h-3 w-3" />
                  Remove
                </Button>
              </div>
              <FormControl>
                <Input
                  placeholder="Enter field text"
                  value={fieldData.text}
                  onChange={(e) => updateField(path, { text: e.target.value })}
                />
              </FormControl>
            </div>

            {/* Field Type Selection */}
            <div className="space-y-2">
              <FormLabel className="font-normal">Field Type</FormLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={fieldData.value !== undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    // Clear children if switching to value type
                    updateField(path, { value: 0, children: undefined });
                  }}
                  className="flex items-center gap-1"
                >
                  <Hash className="h-3 w-3" />
                  Value Field
                </Button>
                <Button
                  type="button"
                  variant={fieldData.value === undefined ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    // Clear value if switching to children type
                    updateField(path, { value: undefined, children: [] });
                  }}
                  className="flex items-center gap-1"
                >
                  <Folder className="h-3 w-3" />
                  Container Field
                </Button>
              </div>
            </div>

            {/* Conditional rendering based on field type */}
            {fieldData.value !== undefined ? (
              <div className="space-y-2">
                <FormLabel className="font-normal">Value</FormLabel>
                <FormControl>
                  <InputNumber
                    value={fieldData.value}
                    onChange={(value) => updateField(path, { value })}
                    placeholder="Enter value"
                    allowDecimals={true}
                  />
                </FormControl>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="font-normal">Child Fields</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addField(path)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Child
                  </Button>
                </div>
                {!hasChildren && (
                  <div className="text-sm text-muted-foreground py-2">
                    No child fields yet. Click "Add Child" to create nested fields.
                  </div>
                )}
              </div>
            )}

          </div>

          {hasChildren && (
            <div className="pt-4 border-t">
              <Accordion type="single" collapsible className="w-full">
                {fieldData.children!.map((child, index) =>
                  renderField(child, `${path}.${index}`, depth + 1)
                )}
              </Accordion>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base font-medium">{label}</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addField()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      {!field.value || field.value.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No conditional fields added yet.</p>
          <p className="text-sm">Click "Add Field" to create your first conditional field.</p>
        </div>
      ) : (
        <div className="flex h-96 border rounded-lg overflow-hidden">
          <TreeSidebar />

          <div className="flex-1 flex flex-col">
            {selectedFieldData && selectedPath ? (
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  {getBreadcrumbs(selectedPath).map((crumb, index, array) => (
                    <div key={index} className="flex items-center gap-2">
                      <span>{crumb}</span>
                      {index < array.length - 1 && <ArrowRight className="h-3 w-3" />}
                    </div>
                  ))}
                </div>

                {/* Field Details */}
                <div className="space-y-4">
                  {/* Field Text */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-normal">Field Text *</FormLabel>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFieldType(selectedPath)}
                          className="flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Switch Type
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(selectedPath)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Enter field text"
                        value={selectedFieldData.text}
                        onChange={(e) => updateField(selectedPath, { text: e.target.value })}
                      />
                    </FormControl>
                  </div>

                  {/* Field Type Selection */}
                  <div className="space-y-2">
                    <FormLabel className="font-normal">Field Type</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={isValueField(selectedFieldData) ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateField(selectedPath, { value: 0, children: undefined })}
                        className="flex items-center gap-1"
                      >
                        <Hash className="h-3 w-3" />
                        Value Field
                      </Button>
                      <Button
                        type="button"
                        variant={isContainerField(selectedFieldData) ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateField(selectedPath, { value: undefined, children: [] })}
                        className="flex items-center gap-1"
                      >
                        <Folder className="h-3 w-3" />
                        Container Field
                      </Button>
                    </div>
                  </div>

                  {/* Conditional content */}
                  {isValueField(selectedFieldData) ? (
                    <div className="space-y-2">
                      <FormLabel className="font-normal">Value</FormLabel>
                      <FormControl>
                        <InputNumber
                          value={selectedFieldData.value}
                          onChange={(value) => updateField(selectedPath, { value })}
                          placeholder="Enter value"
                          allowDecimals={true}
                        />
                      </FormControl>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="font-normal">Child Fields</FormLabel>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBatchAdd(selectedPath)}
                            className="flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Batch Add
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField(selectedPath)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-3 w-3" />
                            Add Child
                          </Button>
                        </div>
                      </div>

                      {/* Batch Add Interface */}
                      {showBatchAdd === selectedPath && (
                        <div className="space-y-2 p-3 border rounded-lg bg-muted/20">
                          <FormLabel className="text-sm">Add multiple fields (comma-separated)</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g., Small, Medium, Large"
                              value={batchAddText}
                              onChange={(e) => setBatchAddText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleBatchAdd(selectedPath);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              className="h-12"
                              onClick={() => handleBatchAdd(selectedPath)}
                              disabled={!batchAddText.trim()}
                            >
                              Add
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-12"
                              onClick={() => {
                                setShowBatchAdd(null);
                                setBatchAddText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {!selectedFieldData.children || selectedFieldData.children.length === 0 ? (
                        <div className="text-sm text-muted-foreground py-4 border rounded-lg text-center">
                          No child fields yet. Click "Add Child" or use "Batch Add" to create nested fields.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedFieldData.children.map((child, index) => (
                            <div
                              key={`${selectedPath}.${index}`}
                              className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 cursor-pointer"
                              onClick={() => setSelectedPath(`${selectedPath}.${index}`)}
                            >
                              <div className="flex items-center gap-2">
                                {isValueField(child) ? (
                                  <Hash className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Folder className="h-3 w-3 text-orange-500" />
                                )}
                                <span className="text-sm">{child.text}</span>
                                {isValueField(child) && child.value !== undefined && (
                                  <Badge variant="secondary" className="text-xs">
                                    {child.value}
                                  </Badge>
                                )}
                              </div>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a field from the sidebar to edit its details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <FormMessage />
    </div>
  );
}
