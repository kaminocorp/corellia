/* eslint-disable */
// Generated from shared/schema and shared/catalog by scripts/contracts-generate.sh
// (scripts/gen-validators.mjs, Ajv 8.20.0). DO NOT EDIT.
// Precompiled so the client runs under a Content-Security-Policy without 'unsafe-eval'.
"use strict";
import * as rt from "../validatorRuntime";
export const validateUISpec = validate20;
const schema31 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://corellia.dev/schema/ui-spec.schema.json","title":"UISpec","description":"A UI spec: a flat map of typed nodes referenced by id, composed through named slots, with data bindings and action records. VISION.md section 5.2.","type":"object","additionalProperties":false,"required":["spec_version","root","nodes","data","actions"],"properties":{"spec_version":{"type":"integer","const":1},"root":{"description":"Id of the root node, or null when nothing is on screen.","type":["string","null"],"pattern":"^[A-Za-z][A-Za-z0-9_-]{0,63}$"},"nodes":{"type":"object","propertyNames":{"$ref":"#/$defs/NodeId"},"additionalProperties":{"$ref":"#/$defs/Node"}},"data":{"description":"Data object that bindings resolve against.","type":"object"},"actions":{"type":"object","propertyNames":{"$ref":"#/$defs/ActionId"},"additionalProperties":{"$ref":"#/$defs/Action"}}},"$defs":{"NodeId":{"type":"string","pattern":"^[A-Za-z][A-Za-z0-9_-]{0,63}$"},"ActionId":{"type":"string","pattern":"^[A-Za-z][A-Za-z0-9_-]{0,63}$"},"ComponentType":{"description":"A component name from the catalog.","type":"string","pattern":"^[A-Z][A-Za-z0-9]{0,31}$"},"Binding":{"description":"A prop value that resolves from the spec's data object. Path syntax: `$` followed by `.key` and `[index]` segments.","type":"object","additionalProperties":false,"required":["bind"],"properties":{"bind":{"$ref":"#/$defs/BindPath"}}},"BindPath":{"type":"string","pattern":"^\\$(\\.[A-Za-z_][A-Za-z0-9_]*|\\[[0-9]+\\])*$"},"Node":{"type":"object","additionalProperties":false,"required":["type"],"properties":{"type":{"$ref":"#/$defs/ComponentType"},"props":{"description":"Component props. Each value is a literal or a Binding. Validated against the component's props schema from the catalog.","type":"object","additionalProperties":{"anyOf":[{"$ref":"#/$defs/Binding"},{}]}},"slots":{"description":"Named slots to ordered child node ids.","type":"object","propertyNames":{"$ref":"#/$defs/SlotName"},"additionalProperties":{"type":"array","items":{"$ref":"#/$defs/NodeId"},"maxItems":64}},"actions":{"description":"Action slots exposed by the component (for example `primary`) bound to action records.","type":"object","propertyNames":{"$ref":"#/$defs/SlotName"},"additionalProperties":{"$ref":"#/$defs/ActionRef"}},"ttl_ms":{"description":"Decay: the client removes the node this many milliseconds after it was last touched. Absent means no decay.","type":"integer","minimum":1000,"maximum":86400000},"pinned":{"description":"Hint for the decision layer: pinned nodes are re-emitted after a `clear` issued by the replace policy. The reducer itself treats pinned and unpinned nodes alike.","type":"boolean","default":false}}},"SlotName":{"type":"string","pattern":"^[a-z][a-z0-9_]{0,31}$"},"ActionRef":{"type":"object","additionalProperties":false,"required":["id","label"],"properties":{"id":{"$ref":"#/$defs/ActionId"},"label":{"type":"string","minLength":1,"maxLength":64},"hotkey":{"description":"Optional keyboard hint. The renderer assigns digits 1-9 when absent.","type":"string","pattern":"^[1-9]$|^enter$|^escape$"}}},"Action":{"description":"A typed action record. `propose` goes through the confirm gate; `tool` runs a read-only tool directly; `navigate` switches the focused panel; `dismiss` removes a node; `send_message` sends text as a user turn.","type":"object","additionalProperties":false,"required":["kind"],"properties":{"kind":{"type":"string","enum":["propose","tool","navigate","dismiss","send_message"]},"tool":{"type":"string","pattern":"^[a-z][a-z0-9_]{0,63}$"},"args":{"type":"object"},"target":{"$ref":"#/$defs/NodeId"},"message":{"type":"string","maxLength":2000},"risk":{"type":"string","enum":["low","medium","high"],"default":"low"}},"allOf":[{"if":{"properties":{"kind":{"const":"propose","type":"string"}}},"then":{"required":["tool"]}},{"if":{"properties":{"kind":{"const":"tool","type":"string"}}},"then":{"required":["tool"]}},{"if":{"properties":{"kind":{"const":"navigate","type":"string"}}},"then":{"required":["target"]}},{"if":{"properties":{"kind":{"const":"dismiss","type":"string"}}},"then":{"required":["target"]}},{"if":{"properties":{"kind":{"const":"send_message","type":"string"}}},"then":{"required":["message"]}}]}}};
const schema32 = {"type":"string","pattern":"^[A-Za-z][A-Za-z0-9_-]{0,63}$"};
const schema41 = {"type":"string","pattern":"^[A-Za-z][A-Za-z0-9_-]{0,63}$"};
const pattern4 = new RegExp("^[A-Za-z][A-Za-z0-9_-]{0,63}$", "u");
const schema33 = {"type":"object","additionalProperties":false,"required":["type"],"properties":{"type":{"$ref":"#/$defs/ComponentType"},"props":{"description":"Component props. Each value is a literal or a Binding. Validated against the component's props schema from the catalog.","type":"object","additionalProperties":{"anyOf":[{"$ref":"#/$defs/Binding"},{}]}},"slots":{"description":"Named slots to ordered child node ids.","type":"object","propertyNames":{"$ref":"#/$defs/SlotName"},"additionalProperties":{"type":"array","items":{"$ref":"#/$defs/NodeId"},"maxItems":64}},"actions":{"description":"Action slots exposed by the component (for example `primary`) bound to action records.","type":"object","propertyNames":{"$ref":"#/$defs/SlotName"},"additionalProperties":{"$ref":"#/$defs/ActionRef"}},"ttl_ms":{"description":"Decay: the client removes the node this many milliseconds after it was last touched. Absent means no decay.","type":"integer","minimum":1000,"maximum":86400000},"pinned":{"description":"Hint for the decision layer: pinned nodes are re-emitted after a `clear` issued by the replace policy. The reducer itself treats pinned and unpinned nodes alike.","type":"boolean","default":false}}};
const schema34 = {"description":"A component name from the catalog.","type":"string","pattern":"^[A-Z][A-Za-z0-9]{0,31}$"};
const schema37 = {"type":"string","pattern":"^[a-z][a-z0-9_]{0,31}$"};
const pattern6 = new RegExp("^[A-Z][A-Za-z0-9]{0,31}$", "u");
const pattern8 = new RegExp("^[a-z][a-z0-9_]{0,31}$", "u");
const schema35 = {"description":"A prop value that resolves from the spec's data object. Path syntax: `$` followed by `.key` and `[index]` segments.","type":"object","additionalProperties":false,"required":["bind"],"properties":{"bind":{"$ref":"#/$defs/BindPath"}}};
const schema36 = {"type":"string","pattern":"^\\$(\\.[A-Za-z_][A-Za-z0-9_]*|\\[[0-9]+\\])*$"};
const pattern7 = new RegExp("^\\$(\\.[A-Za-z_][A-Za-z0-9_]*|\\[[0-9]+\\])*$", "u");

function validate22(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate22.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.bind === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "bind"},message:"must have required property '"+"bind"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!(key0 === "bind")){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.bind !== undefined){
let data0 = data.bind;
if(typeof data0 === "string"){
if(!pattern7.test(data0)){
const err2 = {instancePath:instancePath+"/bind",schemaPath:"#/$defs/BindPath/pattern",keyword:"pattern",params:{pattern: "^\\$(\\.[A-Za-z_][A-Za-z0-9_]*|\\[[0-9]+\\])*$"},message:"must match pattern \""+"^\\$(\\.[A-Za-z_][A-Za-z0-9_]*|\\[[0-9]+\\])*$"+"\""};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
else {
const err3 = {instancePath:instancePath+"/bind",schemaPath:"#/$defs/BindPath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
}
else {
const err4 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
validate22.errors = vErrors;
return errors === 0;
}
validate22.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema40 = {"type":"object","additionalProperties":false,"required":["id","label"],"properties":{"id":{"$ref":"#/$defs/ActionId"},"label":{"type":"string","minLength":1,"maxLength":64},"hotkey":{"description":"Optional keyboard hint. The renderer assigns digits 1-9 when absent.","type":"string","pattern":"^[1-9]$|^enter$|^escape$"}}};
const pattern12 = new RegExp("^[1-9]$|^enter$|^escape$", "u");
const func1 = rt.ucs2length;

function validate24(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate24.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.label === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "id") || (key0 === "label")) || (key0 === "hotkey"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.id !== undefined){
let data0 = data.id;
if(typeof data0 === "string"){
if(!pattern4.test(data0)){
const err3 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/ActionId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/id",schemaPath:"#/$defs/ActionId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.label !== undefined){
let data1 = data.label;
if(typeof data1 === "string"){
if(func1(data1) > 64){
const err5 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(func1(data1) < 1){
const err6 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.hotkey !== undefined){
let data2 = data.hotkey;
if(typeof data2 === "string"){
if(!pattern12.test(data2)){
const err8 = {instancePath:instancePath+"/hotkey",schemaPath:"#/properties/hotkey/pattern",keyword:"pattern",params:{pattern: "^[1-9]$|^enter$|^escape$"},message:"must match pattern \""+"^[1-9]$|^enter$|^escape$"+"\""};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/hotkey",schemaPath:"#/properties/hotkey/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
else {
const err10 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
validate24.errors = vErrors;
return errors === 0;
}
validate24.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate21(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate21.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "type") || (key0 === "props")) || (key0 === "slots")) || (key0 === "actions")) || (key0 === "ttl_ms")) || (key0 === "pinned"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 === "string"){
if(!pattern6.test(data0)){
const err2 = {instancePath:instancePath+"/type",schemaPath:"#/$defs/ComponentType/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9]{0,31}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9]{0,31}$"+"\""};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
else {
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/$defs/ComponentType/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.props !== undefined){
let data1 = data.props;
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
for(const key1 in data1){
const _errs9 = errors;
let valid3 = false;
const _errs10 = errors;
if(!(validate22(data1[key1], {instancePath:instancePath+"/props/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data1,parentDataProperty:key1,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
errors = vErrors.length;
}
var _valid0 = _errs10 === errors;
valid3 = valid3 || _valid0;
var _valid0 = true;
valid3 = valid3 || _valid0;
if(!valid3){
const err4 = {instancePath:instancePath+"/props/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/props/additionalProperties/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
else {
errors = _errs9;
if(vErrors !== null){
if(_errs9){
vErrors.length = _errs9;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err5 = {instancePath:instancePath+"/props",schemaPath:"#/properties/props/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.slots !== undefined){
let data3 = data.slots;
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
for(const key2 in data3){
const _errs13 = errors;
if(typeof key2 === "string"){
if(!pattern8.test(key2)){
const err6 = {instancePath:instancePath+"/slots",schemaPath:"#/$defs/SlotName/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]{0,31}$"},message:"must match pattern \""+"^[a-z][a-z0-9_]{0,31}$"+"\"",propertyName:key2};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/slots",schemaPath:"#/$defs/SlotName/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key2};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
var valid4 = _errs13 === errors;
if(!valid4){
const err8 = {instancePath:instancePath+"/slots",schemaPath:"#/properties/slots/propertyNames",keyword:"propertyNames",params:{propertyName: key2},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
for(const key3 in data3){
let data4 = data3[key3];
if(Array.isArray(data4)){
if(data4.length > 64){
const err9 = {instancePath:instancePath+"/slots/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/slots/additionalProperties/maxItems",keyword:"maxItems",params:{limit: 64},message:"must NOT have more than 64 items"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
const len0 = data4.length;
for(let i0=0; i0<len0; i0++){
let data5 = data4[i0];
if(typeof data5 === "string"){
if(!pattern4.test(data5)){
const err10 = {instancePath:instancePath+"/slots/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0,schemaPath:"#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/slots/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0,schemaPath:"#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath:instancePath+"/slots/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/slots/additionalProperties/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
else {
const err13 = {instancePath:instancePath+"/slots",schemaPath:"#/properties/slots/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.actions !== undefined){
let data6 = data.actions;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
for(const key4 in data6){
const _errs24 = errors;
if(typeof key4 === "string"){
if(!pattern8.test(key4)){
const err14 = {instancePath:instancePath+"/actions",schemaPath:"#/$defs/SlotName/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]{0,31}$"},message:"must match pattern \""+"^[a-z][a-z0-9_]{0,31}$"+"\"",propertyName:key4};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/actions",schemaPath:"#/$defs/SlotName/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key4};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
var valid10 = _errs24 === errors;
if(!valid10){
const err16 = {instancePath:instancePath+"/actions",schemaPath:"#/properties/actions/propertyNames",keyword:"propertyNames",params:{propertyName: key4},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
for(const key5 in data6){
if(!(validate24(data6[key5], {instancePath:instancePath+"/actions/" + key5.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data6,parentDataProperty:key5,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
errors = vErrors.length;
}
}
}
else {
const err17 = {instancePath:instancePath+"/actions",schemaPath:"#/properties/actions/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.ttl_ms !== undefined){
let data8 = data.ttl_ms;
if(!((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8)))){
const err18 = {instancePath:instancePath+"/ttl_ms",schemaPath:"#/properties/ttl_ms/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(typeof data8 == "number"){
if(data8 > 86400000 || isNaN(data8)){
const err19 = {instancePath:instancePath+"/ttl_ms",schemaPath:"#/properties/ttl_ms/maximum",keyword:"maximum",params:{comparison: "<=", limit: 86400000},message:"must be <= 86400000"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(data8 < 1000 || isNaN(data8)){
const err20 = {instancePath:instancePath+"/ttl_ms",schemaPath:"#/properties/ttl_ms/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1000},message:"must be >= 1000"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
}
if(data.pinned !== undefined){
if(typeof data.pinned !== "boolean"){
const err21 = {instancePath:instancePath+"/pinned",schemaPath:"#/properties/pinned/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
}
else {
const err22 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
validate21.errors = vErrors;
return errors === 0;
}
validate21.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema43 = {"description":"A typed action record. `propose` goes through the confirm gate; `tool` runs a read-only tool directly; `navigate` switches the focused panel; `dismiss` removes a node; `send_message` sends text as a user turn.","type":"object","additionalProperties":false,"required":["kind"],"properties":{"kind":{"type":"string","enum":["propose","tool","navigate","dismiss","send_message"]},"tool":{"type":"string","pattern":"^[a-z][a-z0-9_]{0,63}$"},"args":{"type":"object"},"target":{"$ref":"#/$defs/NodeId"},"message":{"type":"string","maxLength":2000},"risk":{"type":"string","enum":["low","medium","high"],"default":"low"}},"allOf":[{"if":{"properties":{"kind":{"const":"propose","type":"string"}}},"then":{"required":["tool"]}},{"if":{"properties":{"kind":{"const":"tool","type":"string"}}},"then":{"required":["tool"]}},{"if":{"properties":{"kind":{"const":"navigate","type":"string"}}},"then":{"required":["target"]}},{"if":{"properties":{"kind":{"const":"dismiss","type":"string"}}},"then":{"required":["target"]}},{"if":{"properties":{"kind":{"const":"send_message","type":"string"}}},"then":{"required":["message"]}}]};
const pattern14 = new RegExp("^[a-z][a-z0-9_]{0,63}$", "u");

function validate27(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate27.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs2 = errors;
let valid1 = true;
const _errs3 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data0 = data.kind;
if(typeof data0 !== "string"){
const err0 = {};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if("propose" !== data0){
const err1 = {};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
}
var _valid0 = _errs3 === errors;
errors = _errs2;
if(vErrors !== null){
if(_errs2){
vErrors.length = _errs2;
}
else {
vErrors = null;
}
}
if(_valid0){
const _errs6 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.tool === undefined){
const err2 = {instancePath,schemaPath:"#/allOf/0/then/required",keyword:"required",params:{missingProperty: "tool"},message:"must have required property '"+"tool"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
var _valid0 = _errs6 === errors;
valid1 = _valid0;
}
if(!valid1){
const err3 = {instancePath,schemaPath:"#/allOf/0/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
const _errs8 = errors;
let valid3 = true;
const _errs9 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data1 = data.kind;
if(typeof data1 !== "string"){
const err4 = {};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if("tool" !== data1){
const err5 = {};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
var _valid1 = _errs9 === errors;
errors = _errs8;
if(vErrors !== null){
if(_errs8){
vErrors.length = _errs8;
}
else {
vErrors = null;
}
}
if(_valid1){
const _errs12 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.tool === undefined){
const err6 = {instancePath,schemaPath:"#/allOf/1/then/required",keyword:"required",params:{missingProperty: "tool"},message:"must have required property '"+"tool"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
var _valid1 = _errs12 === errors;
valid3 = _valid1;
}
if(!valid3){
const err7 = {instancePath,schemaPath:"#/allOf/1/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
const _errs14 = errors;
let valid5 = true;
const _errs15 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data2 = data.kind;
if(typeof data2 !== "string"){
const err8 = {};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if("navigate" !== data2){
const err9 = {};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
var _valid2 = _errs15 === errors;
errors = _errs14;
if(vErrors !== null){
if(_errs14){
vErrors.length = _errs14;
}
else {
vErrors = null;
}
}
if(_valid2){
const _errs18 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.target === undefined){
const err10 = {instancePath,schemaPath:"#/allOf/2/then/required",keyword:"required",params:{missingProperty: "target"},message:"must have required property '"+"target"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
var _valid2 = _errs18 === errors;
valid5 = _valid2;
}
if(!valid5){
const err11 = {instancePath,schemaPath:"#/allOf/2/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
const _errs20 = errors;
let valid7 = true;
const _errs21 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data3 = data.kind;
if(typeof data3 !== "string"){
const err12 = {};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if("dismiss" !== data3){
const err13 = {};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
var _valid3 = _errs21 === errors;
errors = _errs20;
if(vErrors !== null){
if(_errs20){
vErrors.length = _errs20;
}
else {
vErrors = null;
}
}
if(_valid3){
const _errs24 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.target === undefined){
const err14 = {instancePath,schemaPath:"#/allOf/3/then/required",keyword:"required",params:{missingProperty: "target"},message:"must have required property '"+"target"+"'"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
var _valid3 = _errs24 === errors;
valid7 = _valid3;
}
if(!valid7){
const err15 = {instancePath,schemaPath:"#/allOf/3/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
const _errs26 = errors;
let valid9 = true;
const _errs27 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data4 = data.kind;
if(typeof data4 !== "string"){
const err16 = {};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if("send_message" !== data4){
const err17 = {};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
var _valid4 = _errs27 === errors;
errors = _errs26;
if(vErrors !== null){
if(_errs26){
vErrors.length = _errs26;
}
else {
vErrors = null;
}
}
if(_valid4){
const _errs30 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.message === undefined){
const err18 = {instancePath,schemaPath:"#/allOf/4/then/required",keyword:"required",params:{missingProperty: "message"},message:"must have required property '"+"message"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
var _valid4 = _errs30 === errors;
valid9 = _valid4;
}
if(!valid9){
const err19 = {instancePath,schemaPath:"#/allOf/4/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind === undefined){
const err20 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "kind") || (key0 === "tool")) || (key0 === "args")) || (key0 === "target")) || (key0 === "message")) || (key0 === "risk"))){
const err21 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data.kind !== undefined){
let data5 = data.kind;
if(typeof data5 !== "string"){
const err22 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if(!(((((data5 === "propose") || (data5 === "tool")) || (data5 === "navigate")) || (data5 === "dismiss")) || (data5 === "send_message"))){
const err23 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/enum",keyword:"enum",params:{allowedValues: schema43.properties.kind.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data.tool !== undefined){
let data6 = data.tool;
if(typeof data6 === "string"){
if(!pattern14.test(data6)){
const err24 = {instancePath:instancePath+"/tool",schemaPath:"#/properties/tool/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][a-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/tool",schemaPath:"#/properties/tool/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.args !== undefined){
let data7 = data.args;
if(!(data7 && typeof data7 == "object" && !Array.isArray(data7))){
const err26 = {instancePath:instancePath+"/args",schemaPath:"#/properties/args/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
if(data.target !== undefined){
let data8 = data.target;
if(typeof data8 === "string"){
if(!pattern4.test(data8)){
const err27 = {instancePath:instancePath+"/target",schemaPath:"#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
else {
const err28 = {instancePath:instancePath+"/target",schemaPath:"#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data.message !== undefined){
let data9 = data.message;
if(typeof data9 === "string"){
if(func1(data9) > 2000){
const err29 = {instancePath:instancePath+"/message",schemaPath:"#/properties/message/maxLength",keyword:"maxLength",params:{limit: 2000},message:"must NOT have more than 2000 characters"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
else {
const err30 = {instancePath:instancePath+"/message",schemaPath:"#/properties/message/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data.risk !== undefined){
let data10 = data.risk;
if(typeof data10 !== "string"){
const err31 = {instancePath:instancePath+"/risk",schemaPath:"#/properties/risk/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
if(!(((data10 === "low") || (data10 === "medium")) || (data10 === "high"))){
const err32 = {instancePath:instancePath+"/risk",schemaPath:"#/properties/risk/enum",keyword:"enum",params:{allowedValues: schema43.properties.risk.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
}
else {
const err33 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
validate27.errors = vErrors;
return errors === 0;
}
validate27.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate20(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/schema/ui-spec.schema.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate20.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.spec_version === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "spec_version"},message:"must have required property '"+"spec_version"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.root === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "root"},message:"must have required property '"+"root"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.nodes === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "nodes"},message:"must have required property '"+"nodes"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.data === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "data"},message:"must have required property '"+"data"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.actions === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "actions"},message:"must have required property '"+"actions"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key0 in data){
if(!(((((key0 === "spec_version") || (key0 === "root")) || (key0 === "nodes")) || (key0 === "data")) || (key0 === "actions"))){
const err5 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.spec_version !== undefined){
let data0 = data.spec_version;
if(!((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0)))){
const err6 = {instancePath:instancePath+"/spec_version",schemaPath:"#/properties/spec_version/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(1 !== data0){
const err7 = {instancePath:instancePath+"/spec_version",schemaPath:"#/properties/spec_version/const",keyword:"const",params:{allowedValue: 1},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.root !== undefined){
let data1 = data.root;
if((typeof data1 !== "string") && (data1 !== null)){
const err8 = {instancePath:instancePath+"/root",schemaPath:"#/properties/root/type",keyword:"type",params:{type: schema31.properties.root.type},message:"must be string,null"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err9 = {instancePath:instancePath+"/root",schemaPath:"#/properties/root/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
if(data.nodes !== undefined){
let data2 = data.nodes;
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
for(const key1 in data2){
const _errs8 = errors;
if(typeof key1 === "string"){
if(!pattern4.test(key1)){
const err10 = {instancePath:instancePath+"/nodes",schemaPath:"#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\"",propertyName:key1};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/nodes",schemaPath:"#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key1};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
var valid1 = _errs8 === errors;
if(!valid1){
const err12 = {instancePath:instancePath+"/nodes",schemaPath:"#/properties/nodes/propertyNames",keyword:"propertyNames",params:{propertyName: key1},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
for(const key2 in data2){
if(!(validate21(data2[key2], {instancePath:instancePath+"/nodes/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data2,parentDataProperty:key2,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate21.errors : vErrors.concat(validate21.errors);
errors = vErrors.length;
}
}
}
else {
const err13 = {instancePath:instancePath+"/nodes",schemaPath:"#/properties/nodes/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.data !== undefined){
let data4 = data.data;
if(!(data4 && typeof data4 == "object" && !Array.isArray(data4))){
const err14 = {instancePath:instancePath+"/data",schemaPath:"#/properties/data/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.actions !== undefined){
let data5 = data.actions;
if(data5 && typeof data5 == "object" && !Array.isArray(data5)){
for(const key3 in data5){
const _errs17 = errors;
if(typeof key3 === "string"){
if(!pattern4.test(key3)){
const err15 = {instancePath:instancePath+"/actions",schemaPath:"#/$defs/ActionId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\"",propertyName:key3};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
else {
const err16 = {instancePath:instancePath+"/actions",schemaPath:"#/$defs/ActionId/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key3};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
var valid4 = _errs17 === errors;
if(!valid4){
const err17 = {instancePath:instancePath+"/actions",schemaPath:"#/properties/actions/propertyNames",keyword:"propertyNames",params:{propertyName: key3},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
for(const key4 in data5){
if(!(validate27(data5[key4], {instancePath:instancePath+"/actions/" + key4.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data5,parentDataProperty:key4,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate27.errors : vErrors.concat(validate27.errors);
errors = vErrors.length;
}
}
}
else {
const err18 = {instancePath:instancePath+"/actions",schemaPath:"#/properties/actions/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
}
else {
const err19 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
validate20.errors = vErrors;
return errors === 0;
}
validate20.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateOp = validate29;
const schema45 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://corellia.dev/schema/ops.schema.json","title":"SpecOp","description":"Incremental spec operations streamed from the backend to the client (VISION.md section 5.4). The client applies them to its local spec through a reducer; the server validates each against the catalog before forwarding.","oneOf":[{"$ref":"#/$defs/AddNodeOp"},{"$ref":"#/$defs/SetPropsOp"},{"$ref":"#/$defs/SetSlotOp"},{"$ref":"#/$defs/SetDataOp"},{"$ref":"#/$defs/SetActionOp"},{"$ref":"#/$defs/RemoveNodeOp"},{"$ref":"#/$defs/SetRootOp"},{"$ref":"#/$defs/ClearOp"},{"$ref":"#/$defs/DoneOp"}],"$defs":{"AddNodeOp":{"description":"Insert or replace a node. Children referenced in slots may arrive later.","type":"object","additionalProperties":false,"required":["op","id","node"],"properties":{"op":{"const":"add_node","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"},"node":{"$ref":"ui-spec.schema.json#/$defs/Node"}}},"SetPropsOp":{"description":"Shallow-merge props into an existing node.","type":"object","additionalProperties":false,"required":["op","id","props"],"properties":{"op":{"const":"set_props","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"},"props":{"type":"object"}}},"SetSlotOp":{"description":"Replace the ordered children of a slot on an existing node.","type":"object","additionalProperties":false,"required":["op","id","slot","children"],"properties":{"op":{"const":"set_slot","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"},"slot":{"$ref":"ui-spec.schema.json#/$defs/SlotName"},"children":{"type":"array","items":{"$ref":"ui-spec.schema.json#/$defs/NodeId"},"maxItems":64}}},"SetDataOp":{"description":"Write into the data object. Without `path`, `value` must be an object and is shallow-merged into the root. With `path`, `value` is set at that path, creating intermediate objects.","type":"object","additionalProperties":false,"required":["op","value"],"properties":{"op":{"const":"set_data","type":"string"},"path":{"$ref":"ui-spec.schema.json#/$defs/BindPath"},"value":{}}},"SetActionOp":{"description":"Insert or replace a spec-level action record.","type":"object","additionalProperties":false,"required":["op","id","action"],"properties":{"op":{"const":"set_action","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/ActionId"},"action":{"$ref":"ui-spec.schema.json#/$defs/Action"}}},"RemoveNodeOp":{"description":"Remove a node and its slot descendants, and drop it from any parent's slot.","type":"object","additionalProperties":false,"required":["op","id"],"properties":{"op":{"const":"remove_node","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"}}},"SetRootOp":{"description":"Set the root node. The node may arrive later in the same stream.","type":"object","additionalProperties":false,"required":["op","id"],"properties":{"op":{"const":"set_root","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"}}},"ClearOp":{"description":"Remove every node and reset the root. With `all: true` the data object and action records are cleared too; otherwise they are kept so a follow-up can rebuild the tree over the same data.","type":"object","additionalProperties":false,"required":["op"],"properties":{"op":{"const":"clear","type":"string"},"all":{"type":"boolean","default":false}}},"DoneOp":{"description":"Marks the end of a spec stream for this turn. Carries no change; the server runs whole-spec checks (dangling refs, budget) when it sees it.","type":"object","additionalProperties":false,"required":["op"],"properties":{"op":{"const":"done","type":"string"}}}}};
const schema69 = {"description":"Remove every node and reset the root. With `all: true` the data object and action records are cleared too; otherwise they are kept so a follow-up can rebuild the tree over the same data.","type":"object","additionalProperties":false,"required":["op"],"properties":{"op":{"const":"clear","type":"string"},"all":{"type":"boolean","default":false}}};
const schema70 = {"description":"Marks the end of a spec stream for this turn. Carries no change; the server runs whole-spec checks (dangling refs, budget) when it sees it.","type":"object","additionalProperties":false,"required":["op"],"properties":{"op":{"const":"done","type":"string"}}};
const schema46 = {"description":"Insert or replace a node. Children referenced in slots may arrive later.","type":"object","additionalProperties":false,"required":["op","id","node"],"properties":{"op":{"const":"add_node","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"},"node":{"$ref":"ui-spec.schema.json#/$defs/Node"}}};

function validate31(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate31.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "type") || (key0 === "props")) || (key0 === "slots")) || (key0 === "actions")) || (key0 === "ttl_ms")) || (key0 === "pinned"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 === "string"){
if(!pattern6.test(data0)){
const err2 = {instancePath:instancePath+"/type",schemaPath:"#/$defs/ComponentType/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9]{0,31}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9]{0,31}$"+"\""};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
else {
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/$defs/ComponentType/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.props !== undefined){
let data1 = data.props;
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
for(const key1 in data1){
const _errs9 = errors;
let valid3 = false;
const _errs10 = errors;
if(!(validate22(data1[key1], {instancePath:instancePath+"/props/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data1,parentDataProperty:key1,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate22.errors : vErrors.concat(validate22.errors);
errors = vErrors.length;
}
var _valid0 = _errs10 === errors;
valid3 = valid3 || _valid0;
var _valid0 = true;
valid3 = valid3 || _valid0;
if(!valid3){
const err4 = {instancePath:instancePath+"/props/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/props/additionalProperties/anyOf",keyword:"anyOf",params:{},message:"must match a schema in anyOf"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
else {
errors = _errs9;
if(vErrors !== null){
if(_errs9){
vErrors.length = _errs9;
}
else {
vErrors = null;
}
}
}
}
}
else {
const err5 = {instancePath:instancePath+"/props",schemaPath:"#/properties/props/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.slots !== undefined){
let data3 = data.slots;
if(data3 && typeof data3 == "object" && !Array.isArray(data3)){
for(const key2 in data3){
const _errs13 = errors;
if(typeof key2 === "string"){
if(!pattern8.test(key2)){
const err6 = {instancePath:instancePath+"/slots",schemaPath:"#/$defs/SlotName/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]{0,31}$"},message:"must match pattern \""+"^[a-z][a-z0-9_]{0,31}$"+"\"",propertyName:key2};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/slots",schemaPath:"#/$defs/SlotName/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key2};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
var valid4 = _errs13 === errors;
if(!valid4){
const err8 = {instancePath:instancePath+"/slots",schemaPath:"#/properties/slots/propertyNames",keyword:"propertyNames",params:{propertyName: key2},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
for(const key3 in data3){
let data4 = data3[key3];
if(Array.isArray(data4)){
if(data4.length > 64){
const err9 = {instancePath:instancePath+"/slots/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/slots/additionalProperties/maxItems",keyword:"maxItems",params:{limit: 64},message:"must NOT have more than 64 items"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
const len0 = data4.length;
for(let i0=0; i0<len0; i0++){
let data5 = data4[i0];
if(typeof data5 === "string"){
if(!pattern4.test(data5)){
const err10 = {instancePath:instancePath+"/slots/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0,schemaPath:"#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/slots/" + key3.replace(/~/g, "~0").replace(/\//g, "~1")+"/" + i0,schemaPath:"#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath:instancePath+"/slots/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/slots/additionalProperties/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
else {
const err13 = {instancePath:instancePath+"/slots",schemaPath:"#/properties/slots/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.actions !== undefined){
let data6 = data.actions;
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
for(const key4 in data6){
const _errs24 = errors;
if(typeof key4 === "string"){
if(!pattern8.test(key4)){
const err14 = {instancePath:instancePath+"/actions",schemaPath:"#/$defs/SlotName/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]{0,31}$"},message:"must match pattern \""+"^[a-z][a-z0-9_]{0,31}$"+"\"",propertyName:key4};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
else {
const err15 = {instancePath:instancePath+"/actions",schemaPath:"#/$defs/SlotName/type",keyword:"type",params:{type: "string"},message:"must be string",propertyName:key4};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
var valid10 = _errs24 === errors;
if(!valid10){
const err16 = {instancePath:instancePath+"/actions",schemaPath:"#/properties/actions/propertyNames",keyword:"propertyNames",params:{propertyName: key4},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
for(const key5 in data6){
if(!(validate24(data6[key5], {instancePath:instancePath+"/actions/" + key5.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data6,parentDataProperty:key5,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
errors = vErrors.length;
}
}
}
else {
const err17 = {instancePath:instancePath+"/actions",schemaPath:"#/properties/actions/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data.ttl_ms !== undefined){
let data8 = data.ttl_ms;
if(!((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8)))){
const err18 = {instancePath:instancePath+"/ttl_ms",schemaPath:"#/properties/ttl_ms/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
if(typeof data8 == "number"){
if(data8 > 86400000 || isNaN(data8)){
const err19 = {instancePath:instancePath+"/ttl_ms",schemaPath:"#/properties/ttl_ms/maximum",keyword:"maximum",params:{comparison: "<=", limit: 86400000},message:"must be <= 86400000"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(data8 < 1000 || isNaN(data8)){
const err20 = {instancePath:instancePath+"/ttl_ms",schemaPath:"#/properties/ttl_ms/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1000},message:"must be >= 1000"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
}
if(data.pinned !== undefined){
if(typeof data.pinned !== "boolean"){
const err21 = {instancePath:instancePath+"/pinned",schemaPath:"#/properties/pinned/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
}
else {
const err22 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
validate31.errors = vErrors;
return errors === 0;
}
validate31.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate30(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate30.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.op === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.node === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "node"},message:"must have required property '"+"node"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "op") || (key0 === "id")) || (key0 === "node"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.op !== undefined){
let data0 = data.op;
if(typeof data0 !== "string"){
const err4 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if("add_node" !== data0){
const err5 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/const",keyword:"const",params:{allowedValue: "add_node"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.id !== undefined){
let data1 = data.id;
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err6 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.node !== undefined){
if(!(validate31(data.node, {instancePath:instancePath+"/node",parentData:data,parentDataProperty:"node",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate31.errors : vErrors.concat(validate31.errors);
errors = vErrors.length;
}
}
}
else {
const err8 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
validate30.errors = vErrors;
return errors === 0;
}
validate30.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema53 = {"description":"Shallow-merge props into an existing node.","type":"object","additionalProperties":false,"required":["op","id","props"],"properties":{"op":{"const":"set_props","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"},"props":{"type":"object"}}};

function validate36(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate36.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.op === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.props === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "props"},message:"must have required property '"+"props"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "op") || (key0 === "id")) || (key0 === "props"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.op !== undefined){
let data0 = data.op;
if(typeof data0 !== "string"){
const err4 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if("set_props" !== data0){
const err5 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/const",keyword:"const",params:{allowedValue: "set_props"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.id !== undefined){
let data1 = data.id;
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err6 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.props !== undefined){
let data2 = data.props;
if(!(data2 && typeof data2 == "object" && !Array.isArray(data2))){
const err8 = {instancePath:instancePath+"/props",schemaPath:"#/properties/props/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
}
else {
const err9 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
validate36.errors = vErrors;
return errors === 0;
}
validate36.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema55 = {"description":"Replace the ordered children of a slot on an existing node.","type":"object","additionalProperties":false,"required":["op","id","slot","children"],"properties":{"op":{"const":"set_slot","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"},"slot":{"$ref":"ui-spec.schema.json#/$defs/SlotName"},"children":{"type":"array","items":{"$ref":"ui-spec.schema.json#/$defs/NodeId"},"maxItems":64}}};

function validate38(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate38.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.op === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.slot === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "slot"},message:"must have required property '"+"slot"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.children === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "children"},message:"must have required property '"+"children"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "op") || (key0 === "id")) || (key0 === "slot")) || (key0 === "children"))){
const err4 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.op !== undefined){
let data0 = data.op;
if(typeof data0 !== "string"){
const err5 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if("set_slot" !== data0){
const err6 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/const",keyword:"const",params:{allowedValue: "set_slot"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.id !== undefined){
let data1 = data.id;
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err7 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.slot !== undefined){
let data2 = data.slot;
if(typeof data2 === "string"){
if(!pattern8.test(data2)){
const err9 = {instancePath:instancePath+"/slot",schemaPath:"ui-spec.schema.json#/$defs/SlotName/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]{0,31}$"},message:"must match pattern \""+"^[a-z][a-z0-9_]{0,31}$"+"\""};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
else {
const err10 = {instancePath:instancePath+"/slot",schemaPath:"ui-spec.schema.json#/$defs/SlotName/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.children !== undefined){
let data3 = data.children;
if(Array.isArray(data3)){
if(data3.length > 64){
const err11 = {instancePath:instancePath+"/children",schemaPath:"#/properties/children/maxItems",keyword:"maxItems",params:{limit: 64},message:"must NOT have more than 64 items"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
const len0 = data3.length;
for(let i0=0; i0<len0; i0++){
let data4 = data3[i0];
if(typeof data4 === "string"){
if(!pattern4.test(data4)){
const err12 = {instancePath:instancePath+"/children/" + i0,schemaPath:"ui-spec.schema.json#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
else {
const err13 = {instancePath:instancePath+"/children/" + i0,schemaPath:"ui-spec.schema.json#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath:instancePath+"/children",schemaPath:"#/properties/children/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
else {
const err15 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
validate38.errors = vErrors;
return errors === 0;
}
validate38.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema59 = {"description":"Write into the data object. Without `path`, `value` must be an object and is shallow-merged into the root. With `path`, `value` is set at that path, creating intermediate objects.","type":"object","additionalProperties":false,"required":["op","value"],"properties":{"op":{"const":"set_data","type":"string"},"path":{"$ref":"ui-spec.schema.json#/$defs/BindPath"},"value":{}}};

function validate40(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate40.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.op === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.value === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "op") || (key0 === "path")) || (key0 === "value"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.op !== undefined){
let data0 = data.op;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if("set_data" !== data0){
const err4 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/const",keyword:"const",params:{allowedValue: "set_data"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.path !== undefined){
let data1 = data.path;
if(typeof data1 === "string"){
if(!pattern7.test(data1)){
const err5 = {instancePath:instancePath+"/path",schemaPath:"ui-spec.schema.json#/$defs/BindPath/pattern",keyword:"pattern",params:{pattern: "^\\$(\\.[A-Za-z_][A-Za-z0-9_]*|\\[[0-9]+\\])*$"},message:"must match pattern \""+"^\\$(\\.[A-Za-z_][A-Za-z0-9_]*|\\[[0-9]+\\])*$"+"\""};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/path",schemaPath:"ui-spec.schema.json#/$defs/BindPath/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
else {
const err7 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
validate40.errors = vErrors;
return errors === 0;
}
validate40.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema61 = {"description":"Insert or replace a spec-level action record.","type":"object","additionalProperties":false,"required":["op","id","action"],"properties":{"op":{"const":"set_action","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/ActionId"},"action":{"$ref":"ui-spec.schema.json#/$defs/Action"}}};

function validate43(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate43.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs2 = errors;
let valid1 = true;
const _errs3 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data0 = data.kind;
if(typeof data0 !== "string"){
const err0 = {};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if("propose" !== data0){
const err1 = {};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
}
var _valid0 = _errs3 === errors;
errors = _errs2;
if(vErrors !== null){
if(_errs2){
vErrors.length = _errs2;
}
else {
vErrors = null;
}
}
if(_valid0){
const _errs6 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.tool === undefined){
const err2 = {instancePath,schemaPath:"#/allOf/0/then/required",keyword:"required",params:{missingProperty: "tool"},message:"must have required property '"+"tool"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
var _valid0 = _errs6 === errors;
valid1 = _valid0;
}
if(!valid1){
const err3 = {instancePath,schemaPath:"#/allOf/0/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
const _errs8 = errors;
let valid3 = true;
const _errs9 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data1 = data.kind;
if(typeof data1 !== "string"){
const err4 = {};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if("tool" !== data1){
const err5 = {};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
var _valid1 = _errs9 === errors;
errors = _errs8;
if(vErrors !== null){
if(_errs8){
vErrors.length = _errs8;
}
else {
vErrors = null;
}
}
if(_valid1){
const _errs12 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.tool === undefined){
const err6 = {instancePath,schemaPath:"#/allOf/1/then/required",keyword:"required",params:{missingProperty: "tool"},message:"must have required property '"+"tool"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
var _valid1 = _errs12 === errors;
valid3 = _valid1;
}
if(!valid3){
const err7 = {instancePath,schemaPath:"#/allOf/1/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
const _errs14 = errors;
let valid5 = true;
const _errs15 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data2 = data.kind;
if(typeof data2 !== "string"){
const err8 = {};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if("navigate" !== data2){
const err9 = {};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
var _valid2 = _errs15 === errors;
errors = _errs14;
if(vErrors !== null){
if(_errs14){
vErrors.length = _errs14;
}
else {
vErrors = null;
}
}
if(_valid2){
const _errs18 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.target === undefined){
const err10 = {instancePath,schemaPath:"#/allOf/2/then/required",keyword:"required",params:{missingProperty: "target"},message:"must have required property '"+"target"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
var _valid2 = _errs18 === errors;
valid5 = _valid2;
}
if(!valid5){
const err11 = {instancePath,schemaPath:"#/allOf/2/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
const _errs20 = errors;
let valid7 = true;
const _errs21 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data3 = data.kind;
if(typeof data3 !== "string"){
const err12 = {};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if("dismiss" !== data3){
const err13 = {};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
var _valid3 = _errs21 === errors;
errors = _errs20;
if(vErrors !== null){
if(_errs20){
vErrors.length = _errs20;
}
else {
vErrors = null;
}
}
if(_valid3){
const _errs24 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.target === undefined){
const err14 = {instancePath,schemaPath:"#/allOf/3/then/required",keyword:"required",params:{missingProperty: "target"},message:"must have required property '"+"target"+"'"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
var _valid3 = _errs24 === errors;
valid7 = _valid3;
}
if(!valid7){
const err15 = {instancePath,schemaPath:"#/allOf/3/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
const _errs26 = errors;
let valid9 = true;
const _errs27 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind !== undefined){
let data4 = data.kind;
if(typeof data4 !== "string"){
const err16 = {};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if("send_message" !== data4){
const err17 = {};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
var _valid4 = _errs27 === errors;
errors = _errs26;
if(vErrors !== null){
if(_errs26){
vErrors.length = _errs26;
}
else {
vErrors = null;
}
}
if(_valid4){
const _errs30 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.message === undefined){
const err18 = {instancePath,schemaPath:"#/allOf/4/then/required",keyword:"required",params:{missingProperty: "message"},message:"must have required property '"+"message"+"'"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
var _valid4 = _errs30 === errors;
valid9 = _valid4;
}
if(!valid9){
const err19 = {instancePath,schemaPath:"#/allOf/4/if",keyword:"if",params:{failingKeyword: "then"},message:"must match \"then\" schema"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind === undefined){
const err20 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "kind") || (key0 === "tool")) || (key0 === "args")) || (key0 === "target")) || (key0 === "message")) || (key0 === "risk"))){
const err21 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data.kind !== undefined){
let data5 = data.kind;
if(typeof data5 !== "string"){
const err22 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
if(!(((((data5 === "propose") || (data5 === "tool")) || (data5 === "navigate")) || (data5 === "dismiss")) || (data5 === "send_message"))){
const err23 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/enum",keyword:"enum",params:{allowedValues: schema43.properties.kind.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data.tool !== undefined){
let data6 = data.tool;
if(typeof data6 === "string"){
if(!pattern14.test(data6)){
const err24 = {instancePath:instancePath+"/tool",schemaPath:"#/properties/tool/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]{0,63}$"},message:"must match pattern \""+"^[a-z][a-z0-9_]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/tool",schemaPath:"#/properties/tool/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.args !== undefined){
let data7 = data.args;
if(!(data7 && typeof data7 == "object" && !Array.isArray(data7))){
const err26 = {instancePath:instancePath+"/args",schemaPath:"#/properties/args/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
if(data.target !== undefined){
let data8 = data.target;
if(typeof data8 === "string"){
if(!pattern4.test(data8)){
const err27 = {instancePath:instancePath+"/target",schemaPath:"#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
else {
const err28 = {instancePath:instancePath+"/target",schemaPath:"#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data.message !== undefined){
let data9 = data.message;
if(typeof data9 === "string"){
if(func1(data9) > 2000){
const err29 = {instancePath:instancePath+"/message",schemaPath:"#/properties/message/maxLength",keyword:"maxLength",params:{limit: 2000},message:"must NOT have more than 2000 characters"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
else {
const err30 = {instancePath:instancePath+"/message",schemaPath:"#/properties/message/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
if(data.risk !== undefined){
let data10 = data.risk;
if(typeof data10 !== "string"){
const err31 = {instancePath:instancePath+"/risk",schemaPath:"#/properties/risk/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
if(!(((data10 === "low") || (data10 === "medium")) || (data10 === "high"))){
const err32 = {instancePath:instancePath+"/risk",schemaPath:"#/properties/risk/enum",keyword:"enum",params:{allowedValues: schema43.properties.risk.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
}
else {
const err33 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
validate43.errors = vErrors;
return errors === 0;
}
validate43.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate42(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate42.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.op === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.action === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "action"},message:"must have required property '"+"action"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "op") || (key0 === "id")) || (key0 === "action"))){
const err3 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.op !== undefined){
let data0 = data.op;
if(typeof data0 !== "string"){
const err4 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if("set_action" !== data0){
const err5 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/const",keyword:"const",params:{allowedValue: "set_action"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.id !== undefined){
let data1 = data.id;
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err6 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/ActionId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/ActionId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.action !== undefined){
if(!(validate43(data.action, {instancePath:instancePath+"/action",parentData:data,parentDataProperty:"action",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
errors = vErrors.length;
}
}
}
else {
const err8 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
validate42.errors = vErrors;
return errors === 0;
}
validate42.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema65 = {"description":"Remove a node and its slot descendants, and drop it from any parent's slot.","type":"object","additionalProperties":false,"required":["op","id"],"properties":{"op":{"const":"remove_node","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"}}};

function validate46(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate46.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.op === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "op") || (key0 === "id"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.op !== undefined){
let data0 = data.op;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if("remove_node" !== data0){
const err4 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/const",keyword:"const",params:{allowedValue: "remove_node"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.id !== undefined){
let data1 = data.id;
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err5 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
else {
const err7 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
validate46.errors = vErrors;
return errors === 0;
}
validate46.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

const schema67 = {"description":"Set the root node. The node may arrive later in the same stream.","type":"object","additionalProperties":false,"required":["op","id"],"properties":{"op":{"const":"set_root","type":"string"},"id":{"$ref":"ui-spec.schema.json#/$defs/NodeId"}}};

function validate48(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate48.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.op === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "op") || (key0 === "id"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.op !== undefined){
let data0 = data.op;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if("set_root" !== data0){
const err4 = {instancePath:instancePath+"/op",schemaPath:"#/properties/op/const",keyword:"const",params:{allowedValue: "set_root"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.id !== undefined){
let data1 = data.id;
if(typeof data1 === "string"){
if(!pattern4.test(data1)){
const err5 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z][A-Za-z0-9_-]{0,63}$"},message:"must match pattern \""+"^[A-Za-z][A-Za-z0-9_-]{0,63}$"+"\""};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/id",schemaPath:"ui-spec.schema.json#/$defs/NodeId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
else {
const err7 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
validate48.errors = vErrors;
return errors === 0;
}
validate48.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate29(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/schema/ops.schema.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate29.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(!(validate30(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate30.errors : vErrors.concat(validate30.errors);
errors = vErrors.length;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = true;
}
const _errs2 = errors;
if(!(validate36(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate36.errors : vErrors.concat(validate36.errors);
errors = vErrors.length;
}
var _valid0 = _errs2 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = true;
}
}
const _errs3 = errors;
if(!(validate38(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate38.errors : vErrors.concat(validate38.errors);
errors = vErrors.length;
}
var _valid0 = _errs3 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 2];
}
else {
if(_valid0){
valid0 = true;
passing0 = 2;
if(props0 !== true){
props0 = true;
}
}
const _errs4 = errors;
if(!(validate40(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate40.errors : vErrors.concat(validate40.errors);
errors = vErrors.length;
}
var _valid0 = _errs4 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 3];
}
else {
if(_valid0){
valid0 = true;
passing0 = 3;
if(props0 !== true){
props0 = true;
}
}
const _errs5 = errors;
if(!(validate42(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate42.errors : vErrors.concat(validate42.errors);
errors = vErrors.length;
}
var _valid0 = _errs5 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 4];
}
else {
if(_valid0){
valid0 = true;
passing0 = 4;
if(props0 !== true){
props0 = true;
}
}
const _errs6 = errors;
if(!(validate46(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
errors = vErrors.length;
}
var _valid0 = _errs6 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 5];
}
else {
if(_valid0){
valid0 = true;
passing0 = 5;
if(props0 !== true){
props0 = true;
}
}
const _errs7 = errors;
if(!(validate48(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate48.errors : vErrors.concat(validate48.errors);
errors = vErrors.length;
}
var _valid0 = _errs7 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 6];
}
else {
if(_valid0){
valid0 = true;
passing0 = 6;
if(props0 !== true){
props0 = true;
}
}
const _errs8 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.op === undefined){
const err0 = {instancePath,schemaPath:"#/$defs/ClearOp/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "op") || (key0 === "all"))){
const err1 = {instancePath,schemaPath:"#/$defs/ClearOp/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.op !== undefined){
let data0 = data.op;
if(typeof data0 !== "string"){
const err2 = {instancePath:instancePath+"/op",schemaPath:"#/$defs/ClearOp/properties/op/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if("clear" !== data0){
const err3 = {instancePath:instancePath+"/op",schemaPath:"#/$defs/ClearOp/properties/op/const",keyword:"const",params:{allowedValue: "clear"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.all !== undefined){
if(typeof data.all !== "boolean"){
const err4 = {instancePath:instancePath+"/all",schemaPath:"#/$defs/ClearOp/properties/all/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
}
else {
const err5 = {instancePath,schemaPath:"#/$defs/ClearOp/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
var _valid0 = _errs8 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 7];
}
else {
if(_valid0){
valid0 = true;
passing0 = 7;
if(props0 !== true){
props0 = true;
}
}
const _errs16 = errors;
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.op === undefined){
const err6 = {instancePath,schemaPath:"#/$defs/DoneOp/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
for(const key1 in data){
if(!(key1 === "op")){
const err7 = {instancePath,schemaPath:"#/$defs/DoneOp/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.op !== undefined){
let data2 = data.op;
if(typeof data2 !== "string"){
const err8 = {instancePath:instancePath+"/op",schemaPath:"#/$defs/DoneOp/properties/op/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if("done" !== data2){
const err9 = {instancePath:instancePath+"/op",schemaPath:"#/$defs/DoneOp/properties/op/const",keyword:"const",params:{allowedValue: "done"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
else {
const err10 = {instancePath,schemaPath:"#/$defs/DoneOp/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
var _valid0 = _errs16 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 8];
}
else {
if(_valid0){
valid0 = true;
passing0 = 8;
if(props0 !== true){
props0 = true;
}
}
}
}
}
}
}
}
}
}
if(!valid0){
const err11 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate29.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate29.evaluated = {"dynamicProps":true,"dynamicItems":false};

export const validateEvent = validate50;
const schema71 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://corellia.dev/schema/events.schema.json","title":"SessionEvent","description":"Events on the server-to-client stream (SSE). Every event has `type`, a monotonically increasing `seq` used for replay, and `ts`. Turn-scoped events carry `turn_id`.","oneOf":[{"$ref":"#/$defs/SessionEventSnapshot"},{"$ref":"#/$defs/StateEvent"},{"$ref":"#/$defs/TextDeltaEvent"},{"$ref":"#/$defs/SpecOpEvent"},{"$ref":"#/$defs/SpeechEvent"},{"$ref":"#/$defs/ProposalEvent"},{"$ref":"#/$defs/ToolCallEvent"},{"$ref":"#/$defs/ToolResultEvent"},{"$ref":"#/$defs/TurnStartedEvent"},{"$ref":"#/$defs/TurnDoneEvent"},{"$ref":"#/$defs/ErrorEvent"},{"$ref":"#/$defs/ProactiveEvent"},{"$ref":"#/$defs/HeartbeatEvent"}],"$defs":{"Base":{"type":"object","required":["type","seq","ts"],"properties":{"seq":{"type":"integer","minimum":0},"ts":{"type":"string","format":"date-time"},"turn_id":{"$ref":"#/$defs/TurnId"}}},"TurnId":{"type":"string","pattern":"^[A-Za-z0-9_-]{1,64}$"},"AgentState":{"description":"The 3D agent's presentation state.","type":"string","enum":["idle","listening","thinking","speaking","error"]},"Modality":{"description":"How the decision layer chose to surface a reply.","type":"string","enum":["none","voice","glance","visual","both"]},"SessionEventSnapshot":{"description":"Sent first on every (re)connect: the full current state so the client can render without replay.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","session_id","agent_state","spec","pending_proposals","capabilities"],"properties":{"type":{"const":"session","type":"string"},"session_id":{"type":"string"},"agent_name":{"type":"string"},"agent_state":{"$ref":"#/$defs/AgentState"},"spec":{"$ref":"ui-spec.schema.json"},"pending_proposals":{"type":"array","items":{"$ref":"#/$defs/Proposal"}},"capabilities":{"$ref":"#/$defs/Capabilities"},"transcript":{"type":"array","items":{"$ref":"#/$defs/TranscriptEntry"}}}},"Capabilities":{"type":"object","required":["runtime","streaming","ui_ops","stt","tts"],"properties":{"runtime":{"type":"string"},"streaming":{"type":"boolean"},"ui_ops":{"type":"boolean"},"tools":{"type":"boolean"},"cancel":{"type":"boolean"},"stt":{"type":"string","description":"Server STT provider name, or `none` (client falls back to browser recognition)."},"tts":{"type":"string","description":"Server TTS provider name, or `none` (client falls back to speechSynthesis)."}}},"TranscriptEntry":{"type":"object","required":["role","text","ts"],"properties":{"role":{"type":"string","enum":["user","agent","system"]},"text":{"type":"string"},"ts":{"type":"string","format":"date-time"},"turn_id":{"$ref":"#/$defs/TurnId"},"source":{"type":"string","enum":["keyboard","voice","proactive","action"]}}},"StateEvent":{"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","state"],"properties":{"type":{"const":"state","type":"string"},"state":{"$ref":"#/$defs/AgentState"},"detail":{"type":"string"}}},"TurnStartedEvent":{"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","text","source"],"properties":{"type":{"const":"turn_started","type":"string"},"text":{"type":"string"},"source":{"type":"string","enum":["keyboard","voice","proactive","action"]}}},"TextDeltaEvent":{"description":"A chunk of the agent's textual reply for the transcript.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","delta"],"properties":{"type":{"const":"text_delta","type":"string"},"delta":{"type":"string"}}},"SpecOpEvent":{"description":"A validated spec op. The client applies it with the shared reducer.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","op"],"properties":{"type":{"const":"spec_op","type":"string"},"op":{"$ref":"ops.schema.json"},"modality":{"$ref":"#/$defs/Modality"}}},"SpeechEvent":{"description":"Text the decision layer chose to say aloud, in sentence-sized pieces. `audio_url` is set when a server TTS provider rendered it; otherwise the client synthesises.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","text"],"properties":{"type":{"const":"speech","type":"string"},"text":{"type":"string"},"audio_url":{"type":"string"},"final":{"type":"boolean","default":false}}},"Proposal":{"type":"object","required":["id","tool","args","label","risk","expires_at"],"properties":{"id":{"type":"string"},"tool":{"type":"string"},"args":{"type":"object"},"label":{"type":"string"},"detail":{"type":"string"},"risk":{"type":"string","enum":["low","medium","high"]},"expires_at":{"type":"string","format":"date-time"}}},"ProposalEvent":{"description":"A proposed side effect awaiting confirmation (VISION.md 5.6). `status` moves pending -> confirmed|rejected|expired.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","proposal","status"],"properties":{"type":{"const":"proposal","type":"string"},"proposal":{"$ref":"#/$defs/Proposal"},"status":{"type":"string","enum":["pending","confirmed","rejected","expired","executed","failed"]}}},"ToolCallEvent":{"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","call_id","tool","args"],"properties":{"type":{"const":"tool_call","type":"string"},"call_id":{"type":"string"},"tool":{"type":"string"},"args":{"type":"object"}}},"ToolResultEvent":{"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","call_id","tool","ok"],"properties":{"type":{"const":"tool_result","type":"string"},"call_id":{"type":"string"},"tool":{"type":"string"},"ok":{"type":"boolean"},"summary":{"type":"string"},"error":{"type":"string"}}},"TurnDoneEvent":{"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","status"],"properties":{"type":{"const":"turn_done","type":"string"},"status":{"type":"string","enum":["completed","cancelled","failed"]},"text":{"type":"string","description":"The full reply text for the transcript."},"modality":{"$ref":"#/$defs/Modality"}}},"ErrorEvent":{"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","code","message"],"properties":{"type":{"const":"error","type":"string"},"code":{"type":"string"},"message":{"type":"string"},"fatal":{"type":"boolean","default":false}}},"ProactiveEvent":{"description":"Something the agent put on screen unprompted (reminder, ambient card). The accompanying spec ops and speech follow as normal events with the same turn_id.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","source","title"],"properties":{"type":{"const":"proactive","type":"string"},"source":{"type":"string","enum":["reminder","ambient","runtime"]},"title":{"type":"string"}}},"HeartbeatEvent":{"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type"],"properties":{"type":{"const":"heartbeat","type":"string"}}}}};
const schema72 = {"description":"Sent first on every (re)connect: the full current state so the client can render without replay.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","session_id","agent_state","spec","pending_proposals","capabilities"],"properties":{"type":{"const":"session","type":"string"},"session_id":{"type":"string"},"agent_name":{"type":"string"},"agent_state":{"$ref":"#/$defs/AgentState"},"spec":{"$ref":"ui-spec.schema.json"},"pending_proposals":{"type":"array","items":{"$ref":"#/$defs/Proposal"}},"capabilities":{"$ref":"#/$defs/Capabilities"},"transcript":{"type":"array","items":{"$ref":"#/$defs/TranscriptEntry"}}}};
const schema75 = {"description":"The 3D agent's presentation state.","type":"string","enum":["idle","listening","thinking","speaking","error"]};
const schema76 = {"type":"object","required":["id","tool","args","label","risk","expires_at"],"properties":{"id":{"type":"string"},"tool":{"type":"string"},"args":{"type":"object"},"label":{"type":"string"},"detail":{"type":"string"},"risk":{"type":"string","enum":["low","medium","high"]},"expires_at":{"type":"string","format":"date-time"}}};
const schema77 = {"type":"object","required":["runtime","streaming","ui_ops","stt","tts"],"properties":{"runtime":{"type":"string"},"streaming":{"type":"boolean"},"ui_ops":{"type":"boolean"},"tools":{"type":"boolean"},"cancel":{"type":"boolean"},"stt":{"type":"string","description":"Server STT provider name, or `none` (client falls back to browser recognition)."},"tts":{"type":"string","description":"Server TTS provider name, or `none` (client falls back to speechSynthesis)."}}};
const schema73 = {"type":"object","required":["type","seq","ts"],"properties":{"seq":{"type":"integer","minimum":0},"ts":{"type":"string","format":"date-time"},"turn_id":{"$ref":"#/$defs/TurnId"}}};
const schema74 = {"type":"string","pattern":"^[A-Za-z0-9_-]{1,64}$"};
const formats0 = rt.formats["date-time"];
const pattern31 = new RegExp("^[A-Za-z0-9_-]{1,64}$", "u");

function validate52(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate52.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.seq === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "seq"},message:"must have required property '"+"seq"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.ts === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "ts"},message:"must have required property '"+"ts"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.seq !== undefined){
let data0 = data.seq;
if(!((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0)))){
const err3 = {instancePath:instancePath+"/seq",schemaPath:"#/properties/seq/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(typeof data0 == "number"){
if(data0 < 0 || isNaN(data0)){
const err4 = {instancePath:instancePath+"/seq",schemaPath:"#/properties/seq/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0},message:"must be >= 0"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
}
if(data.ts !== undefined){
let data1 = data.ts;
if(typeof data1 === "string"){
if(!(formats0.validate(data1))){
const err5 = {instancePath:instancePath+"/ts",schemaPath:"#/properties/ts/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/ts",schemaPath:"#/properties/ts/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.turn_id !== undefined){
let data2 = data.turn_id;
if(typeof data2 === "string"){
if(!pattern31.test(data2)){
const err7 = {instancePath:instancePath+"/turn_id",schemaPath:"#/$defs/TurnId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]{1,64}$"},message:"must match pattern \""+"^[A-Za-z0-9_-]{1,64}$"+"\""};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/turn_id",schemaPath:"#/$defs/TurnId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
}
else {
const err9 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
validate52.errors = vErrors;
return errors === 0;
}
validate52.evaluated = {"props":{"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema78 = {"type":"object","required":["role","text","ts"],"properties":{"role":{"type":"string","enum":["user","agent","system"]},"text":{"type":"string"},"ts":{"type":"string","format":"date-time"},"turn_id":{"$ref":"#/$defs/TurnId"},"source":{"type":"string","enum":["keyboard","voice","proactive","action"]}}};

function validate55(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate55.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.role === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "role"},message:"must have required property '"+"role"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.text === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "text"},message:"must have required property '"+"text"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.ts === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "ts"},message:"must have required property '"+"ts"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.role !== undefined){
let data0 = data.role;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/role",schemaPath:"#/properties/role/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(!(((data0 === "user") || (data0 === "agent")) || (data0 === "system"))){
const err4 = {instancePath:instancePath+"/role",schemaPath:"#/properties/role/enum",keyword:"enum",params:{allowedValues: schema78.properties.role.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.text !== undefined){
if(typeof data.text !== "string"){
const err5 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.ts !== undefined){
let data2 = data.ts;
if(typeof data2 === "string"){
if(!(formats0.validate(data2))){
const err6 = {instancePath:instancePath+"/ts",schemaPath:"#/properties/ts/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/ts",schemaPath:"#/properties/ts/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.turn_id !== undefined){
let data3 = data.turn_id;
if(typeof data3 === "string"){
if(!pattern31.test(data3)){
const err8 = {instancePath:instancePath+"/turn_id",schemaPath:"#/$defs/TurnId/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z0-9_-]{1,64}$"},message:"must match pattern \""+"^[A-Za-z0-9_-]{1,64}$"+"\""};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/turn_id",schemaPath:"#/$defs/TurnId/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.source !== undefined){
let data4 = data.source;
if(typeof data4 !== "string"){
const err10 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(!((((data4 === "keyboard") || (data4 === "voice")) || (data4 === "proactive")) || (data4 === "action"))){
const err11 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/enum",keyword:"enum",params:{allowedValues: schema78.properties.source.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
validate55.errors = vErrors;
return errors === 0;
}
validate55.evaluated = {"props":{"role":true,"text":true,"ts":true,"turn_id":true,"source":true},"dynamicProps":false,"dynamicItems":false};


function validate51(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate51.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.session_id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "session_id"},message:"must have required property '"+"session_id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.agent_state === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "agent_state"},message:"must have required property '"+"agent_state"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.spec === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "spec"},message:"must have required property '"+"spec"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.pending_proposals === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "pending_proposals"},message:"must have required property '"+"pending_proposals"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.capabilities === undefined){
const err5 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "capabilities"},message:"must have required property '"+"capabilities"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err6 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if("session" !== data0){
const err7 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "session"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.session_id !== undefined){
if(typeof data.session_id !== "string"){
const err8 = {instancePath:instancePath+"/session_id",schemaPath:"#/properties/session_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.agent_name !== undefined){
if(typeof data.agent_name !== "string"){
const err9 = {instancePath:instancePath+"/agent_name",schemaPath:"#/properties/agent_name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.agent_state !== undefined){
let data3 = data.agent_state;
if(typeof data3 !== "string"){
const err10 = {instancePath:instancePath+"/agent_state",schemaPath:"#/$defs/AgentState/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(!(((((data3 === "idle") || (data3 === "listening")) || (data3 === "thinking")) || (data3 === "speaking")) || (data3 === "error"))){
const err11 = {instancePath:instancePath+"/agent_state",schemaPath:"#/$defs/AgentState/enum",keyword:"enum",params:{allowedValues: schema75.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data.spec !== undefined){
if(!(validate20(data.spec, {instancePath:instancePath+"/spec",parentData:data,parentDataProperty:"spec",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate20.errors : vErrors.concat(validate20.errors);
errors = vErrors.length;
}
}
if(data.pending_proposals !== undefined){
let data5 = data.pending_proposals;
if(Array.isArray(data5)){
const len0 = data5.length;
for(let i0=0; i0<len0; i0++){
let data6 = data5[i0];
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
if(data6.id === undefined){
const err12 = {instancePath:instancePath+"/pending_proposals/" + i0,schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(data6.tool === undefined){
const err13 = {instancePath:instancePath+"/pending_proposals/" + i0,schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "tool"},message:"must have required property '"+"tool"+"'"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(data6.args === undefined){
const err14 = {instancePath:instancePath+"/pending_proposals/" + i0,schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "args"},message:"must have required property '"+"args"+"'"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
if(data6.label === undefined){
const err15 = {instancePath:instancePath+"/pending_proposals/" + i0,schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
if(data6.risk === undefined){
const err16 = {instancePath:instancePath+"/pending_proposals/" + i0,schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "risk"},message:"must have required property '"+"risk"+"'"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if(data6.expires_at === undefined){
const err17 = {instancePath:instancePath+"/pending_proposals/" + i0,schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "expires_at"},message:"must have required property '"+"expires_at"+"'"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
if(data6.id !== undefined){
if(typeof data6.id !== "string"){
const err18 = {instancePath:instancePath+"/pending_proposals/" + i0+"/id",schemaPath:"#/$defs/Proposal/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
if(data6.tool !== undefined){
if(typeof data6.tool !== "string"){
const err19 = {instancePath:instancePath+"/pending_proposals/" + i0+"/tool",schemaPath:"#/$defs/Proposal/properties/tool/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data6.args !== undefined){
let data9 = data6.args;
if(!(data9 && typeof data9 == "object" && !Array.isArray(data9))){
const err20 = {instancePath:instancePath+"/pending_proposals/" + i0+"/args",schemaPath:"#/$defs/Proposal/properties/args/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data6.label !== undefined){
if(typeof data6.label !== "string"){
const err21 = {instancePath:instancePath+"/pending_proposals/" + i0+"/label",schemaPath:"#/$defs/Proposal/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data6.detail !== undefined){
if(typeof data6.detail !== "string"){
const err22 = {instancePath:instancePath+"/pending_proposals/" + i0+"/detail",schemaPath:"#/$defs/Proposal/properties/detail/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
if(data6.risk !== undefined){
let data12 = data6.risk;
if(typeof data12 !== "string"){
const err23 = {instancePath:instancePath+"/pending_proposals/" + i0+"/risk",schemaPath:"#/$defs/Proposal/properties/risk/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
if(!(((data12 === "low") || (data12 === "medium")) || (data12 === "high"))){
const err24 = {instancePath:instancePath+"/pending_proposals/" + i0+"/risk",schemaPath:"#/$defs/Proposal/properties/risk/enum",keyword:"enum",params:{allowedValues: schema76.properties.risk.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data6.expires_at !== undefined){
let data13 = data6.expires_at;
if(typeof data13 === "string"){
if(!(formats0.validate(data13))){
const err25 = {instancePath:instancePath+"/pending_proposals/" + i0+"/expires_at",schemaPath:"#/$defs/Proposal/properties/expires_at/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
else {
const err26 = {instancePath:instancePath+"/pending_proposals/" + i0+"/expires_at",schemaPath:"#/$defs/Proposal/properties/expires_at/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
}
else {
const err27 = {instancePath:instancePath+"/pending_proposals/" + i0,schemaPath:"#/$defs/Proposal/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
else {
const err28 = {instancePath:instancePath+"/pending_proposals",schemaPath:"#/properties/pending_proposals/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
if(data.capabilities !== undefined){
let data14 = data.capabilities;
if(data14 && typeof data14 == "object" && !Array.isArray(data14)){
if(data14.runtime === undefined){
const err29 = {instancePath:instancePath+"/capabilities",schemaPath:"#/$defs/Capabilities/required",keyword:"required",params:{missingProperty: "runtime"},message:"must have required property '"+"runtime"+"'"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
if(data14.streaming === undefined){
const err30 = {instancePath:instancePath+"/capabilities",schemaPath:"#/$defs/Capabilities/required",keyword:"required",params:{missingProperty: "streaming"},message:"must have required property '"+"streaming"+"'"};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
if(data14.ui_ops === undefined){
const err31 = {instancePath:instancePath+"/capabilities",schemaPath:"#/$defs/Capabilities/required",keyword:"required",params:{missingProperty: "ui_ops"},message:"must have required property '"+"ui_ops"+"'"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
if(data14.stt === undefined){
const err32 = {instancePath:instancePath+"/capabilities",schemaPath:"#/$defs/Capabilities/required",keyword:"required",params:{missingProperty: "stt"},message:"must have required property '"+"stt"+"'"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
if(data14.tts === undefined){
const err33 = {instancePath:instancePath+"/capabilities",schemaPath:"#/$defs/Capabilities/required",keyword:"required",params:{missingProperty: "tts"},message:"must have required property '"+"tts"+"'"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
if(data14.runtime !== undefined){
if(typeof data14.runtime !== "string"){
const err34 = {instancePath:instancePath+"/capabilities/runtime",schemaPath:"#/$defs/Capabilities/properties/runtime/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
if(data14.streaming !== undefined){
if(typeof data14.streaming !== "boolean"){
const err35 = {instancePath:instancePath+"/capabilities/streaming",schemaPath:"#/$defs/Capabilities/properties/streaming/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
if(data14.ui_ops !== undefined){
if(typeof data14.ui_ops !== "boolean"){
const err36 = {instancePath:instancePath+"/capabilities/ui_ops",schemaPath:"#/$defs/Capabilities/properties/ui_ops/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
}
if(data14.tools !== undefined){
if(typeof data14.tools !== "boolean"){
const err37 = {instancePath:instancePath+"/capabilities/tools",schemaPath:"#/$defs/Capabilities/properties/tools/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err37];
}
else {
vErrors.push(err37);
}
errors++;
}
}
if(data14.cancel !== undefined){
if(typeof data14.cancel !== "boolean"){
const err38 = {instancePath:instancePath+"/capabilities/cancel",schemaPath:"#/$defs/Capabilities/properties/cancel/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err38];
}
else {
vErrors.push(err38);
}
errors++;
}
}
if(data14.stt !== undefined){
if(typeof data14.stt !== "string"){
const err39 = {instancePath:instancePath+"/capabilities/stt",schemaPath:"#/$defs/Capabilities/properties/stt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err39];
}
else {
vErrors.push(err39);
}
errors++;
}
}
if(data14.tts !== undefined){
if(typeof data14.tts !== "string"){
const err40 = {instancePath:instancePath+"/capabilities/tts",schemaPath:"#/$defs/Capabilities/properties/tts/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err40];
}
else {
vErrors.push(err40);
}
errors++;
}
}
}
else {
const err41 = {instancePath:instancePath+"/capabilities",schemaPath:"#/$defs/Capabilities/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err41];
}
else {
vErrors.push(err41);
}
errors++;
}
}
if(data.transcript !== undefined){
let data22 = data.transcript;
if(Array.isArray(data22)){
const len1 = data22.length;
for(let i1=0; i1<len1; i1++){
if(!(validate55(data22[i1], {instancePath:instancePath+"/transcript/" + i1,parentData:data22,parentDataProperty:i1,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate55.errors : vErrors.concat(validate55.errors);
errors = vErrors.length;
}
}
}
else {
const err42 = {instancePath:instancePath+"/transcript",schemaPath:"#/properties/transcript/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err42];
}
else {
vErrors.push(err42);
}
errors++;
}
}
}
else {
const err43 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err43];
}
else {
vErrors.push(err43);
}
errors++;
}
validate51.errors = vErrors;
return errors === 0;
}
validate51.evaluated = {"props":{"type":true,"session_id":true,"agent_name":true,"agent_state":true,"spec":true,"pending_proposals":true,"capabilities":true,"transcript":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema80 = {"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","state"],"properties":{"type":{"const":"state","type":"string"},"state":{"$ref":"#/$defs/AgentState"},"detail":{"type":"string"}}};

function validate58(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate58.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.state === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "state"},message:"must have required property '"+"state"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err2 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if("state" !== data0){
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "state"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.state !== undefined){
let data1 = data.state;
if(typeof data1 !== "string"){
const err4 = {instancePath:instancePath+"/state",schemaPath:"#/$defs/AgentState/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(!(((((data1 === "idle") || (data1 === "listening")) || (data1 === "thinking")) || (data1 === "speaking")) || (data1 === "error"))){
const err5 = {instancePath:instancePath+"/state",schemaPath:"#/$defs/AgentState/enum",keyword:"enum",params:{allowedValues: schema75.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.detail !== undefined){
if(typeof data.detail !== "string"){
const err6 = {instancePath:instancePath+"/detail",schemaPath:"#/properties/detail/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
else {
const err7 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
validate58.errors = vErrors;
return errors === 0;
}
validate58.evaluated = {"props":{"type":true,"state":true,"detail":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema82 = {"description":"A chunk of the agent's textual reply for the transcript.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","delta"],"properties":{"type":{"const":"text_delta","type":"string"},"delta":{"type":"string"}}};

function validate61(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate61.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.turn_id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "turn_id"},message:"must have required property '"+"turn_id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.delta === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "delta"},message:"must have required property '"+"delta"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if("text_delta" !== data0){
const err4 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "text_delta"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.delta !== undefined){
if(typeof data.delta !== "string"){
const err5 = {instancePath:instancePath+"/delta",schemaPath:"#/properties/delta/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
validate61.errors = vErrors;
return errors === 0;
}
validate61.evaluated = {"props":{"type":true,"delta":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema83 = {"description":"A validated spec op. The client applies it with the shared reducer.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","op"],"properties":{"type":{"const":"spec_op","type":"string"},"op":{"$ref":"ops.schema.json"},"modality":{"$ref":"#/$defs/Modality"}}};
const schema84 = {"description":"How the decision layer chose to surface a reply.","type":"string","enum":["none","voice","glance","visual","both"]};

function validate64(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate64.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.op === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "op"},message:"must have required property '"+"op"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err2 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if("spec_op" !== data0){
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "spec_op"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.op !== undefined){
if(!(validate29(data.op, {instancePath:instancePath+"/op",parentData:data,parentDataProperty:"op",rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate29.errors : vErrors.concat(validate29.errors);
errors = vErrors.length;
}
}
if(data.modality !== undefined){
let data2 = data.modality;
if(typeof data2 !== "string"){
const err4 = {instancePath:instancePath+"/modality",schemaPath:"#/$defs/Modality/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(!(((((data2 === "none") || (data2 === "voice")) || (data2 === "glance")) || (data2 === "visual")) || (data2 === "both"))){
const err5 = {instancePath:instancePath+"/modality",schemaPath:"#/$defs/Modality/enum",keyword:"enum",params:{allowedValues: schema84.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
validate64.errors = vErrors;
return errors === 0;
}
validate64.evaluated = {"props":{"type":true,"op":true,"modality":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema85 = {"description":"Text the decision layer chose to say aloud, in sentence-sized pieces. `audio_url` is set when a server TTS provider rendered it; otherwise the client synthesises.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","text"],"properties":{"type":{"const":"speech","type":"string"},"text":{"type":"string"},"audio_url":{"type":"string"},"final":{"type":"boolean","default":false}}};

function validate68(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate68.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.text === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "text"},message:"must have required property '"+"text"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err2 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if("speech" !== data0){
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "speech"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.text !== undefined){
if(typeof data.text !== "string"){
const err4 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.audio_url !== undefined){
if(typeof data.audio_url !== "string"){
const err5 = {instancePath:instancePath+"/audio_url",schemaPath:"#/properties/audio_url/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.final !== undefined){
if(typeof data.final !== "boolean"){
const err6 = {instancePath:instancePath+"/final",schemaPath:"#/properties/final/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
else {
const err7 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
validate68.errors = vErrors;
return errors === 0;
}
validate68.evaluated = {"props":{"type":true,"text":true,"audio_url":true,"final":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema86 = {"description":"A proposed side effect awaiting confirmation (VISION.md 5.6). `status` moves pending -> confirmed|rejected|expired.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","proposal","status"],"properties":{"type":{"const":"proposal","type":"string"},"proposal":{"$ref":"#/$defs/Proposal"},"status":{"type":"string","enum":["pending","confirmed","rejected","expired","executed","failed"]}}};

function validate71(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate71.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.proposal === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "proposal"},message:"must have required property '"+"proposal"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.status === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if("proposal" !== data0){
const err4 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "proposal"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.proposal !== undefined){
let data1 = data.proposal;
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
if(data1.id === undefined){
const err5 = {instancePath:instancePath+"/proposal",schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "id"},message:"must have required property '"+"id"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data1.tool === undefined){
const err6 = {instancePath:instancePath+"/proposal",schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "tool"},message:"must have required property '"+"tool"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data1.args === undefined){
const err7 = {instancePath:instancePath+"/proposal",schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "args"},message:"must have required property '"+"args"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data1.label === undefined){
const err8 = {instancePath:instancePath+"/proposal",schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(data1.risk === undefined){
const err9 = {instancePath:instancePath+"/proposal",schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "risk"},message:"must have required property '"+"risk"+"'"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(data1.expires_at === undefined){
const err10 = {instancePath:instancePath+"/proposal",schemaPath:"#/$defs/Proposal/required",keyword:"required",params:{missingProperty: "expires_at"},message:"must have required property '"+"expires_at"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(data1.id !== undefined){
if(typeof data1.id !== "string"){
const err11 = {instancePath:instancePath+"/proposal/id",schemaPath:"#/$defs/Proposal/properties/id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data1.tool !== undefined){
if(typeof data1.tool !== "string"){
const err12 = {instancePath:instancePath+"/proposal/tool",schemaPath:"#/$defs/Proposal/properties/tool/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
if(data1.args !== undefined){
let data4 = data1.args;
if(!(data4 && typeof data4 == "object" && !Array.isArray(data4))){
const err13 = {instancePath:instancePath+"/proposal/args",schemaPath:"#/$defs/Proposal/properties/args/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data1.label !== undefined){
if(typeof data1.label !== "string"){
const err14 = {instancePath:instancePath+"/proposal/label",schemaPath:"#/$defs/Proposal/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data1.detail !== undefined){
if(typeof data1.detail !== "string"){
const err15 = {instancePath:instancePath+"/proposal/detail",schemaPath:"#/$defs/Proposal/properties/detail/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data1.risk !== undefined){
let data7 = data1.risk;
if(typeof data7 !== "string"){
const err16 = {instancePath:instancePath+"/proposal/risk",schemaPath:"#/$defs/Proposal/properties/risk/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
if(!(((data7 === "low") || (data7 === "medium")) || (data7 === "high"))){
const err17 = {instancePath:instancePath+"/proposal/risk",schemaPath:"#/$defs/Proposal/properties/risk/enum",keyword:"enum",params:{allowedValues: schema76.properties.risk.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
if(data1.expires_at !== undefined){
let data8 = data1.expires_at;
if(typeof data8 === "string"){
if(!(formats0.validate(data8))){
const err18 = {instancePath:instancePath+"/proposal/expires_at",schemaPath:"#/$defs/Proposal/properties/expires_at/format",keyword:"format",params:{format: "date-time"},message:"must match format \""+"date-time"+"\""};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
else {
const err19 = {instancePath:instancePath+"/proposal/expires_at",schemaPath:"#/$defs/Proposal/properties/expires_at/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
}
else {
const err20 = {instancePath:instancePath+"/proposal",schemaPath:"#/$defs/Proposal/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data.status !== undefined){
let data9 = data.status;
if(typeof data9 !== "string"){
const err21 = {instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(!((((((data9 === "pending") || (data9 === "confirmed")) || (data9 === "rejected")) || (data9 === "expired")) || (data9 === "executed")) || (data9 === "failed"))){
const err22 = {instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema86.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
}
else {
const err23 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
validate71.errors = vErrors;
return errors === 0;
}
validate71.evaluated = {"props":{"type":true,"proposal":true,"status":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema88 = {"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","call_id","tool","args"],"properties":{"type":{"const":"tool_call","type":"string"},"call_id":{"type":"string"},"tool":{"type":"string"},"args":{"type":"object"}}};

function validate74(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate74.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.turn_id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "turn_id"},message:"must have required property '"+"turn_id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.call_id === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "call_id"},message:"must have required property '"+"call_id"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.tool === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "tool"},message:"must have required property '"+"tool"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.args === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "args"},message:"must have required property '"+"args"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err5 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if("tool_call" !== data0){
const err6 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "tool_call"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.call_id !== undefined){
if(typeof data.call_id !== "string"){
const err7 = {instancePath:instancePath+"/call_id",schemaPath:"#/properties/call_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.tool !== undefined){
if(typeof data.tool !== "string"){
const err8 = {instancePath:instancePath+"/tool",schemaPath:"#/properties/tool/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.args !== undefined){
let data3 = data.args;
if(!(data3 && typeof data3 == "object" && !Array.isArray(data3))){
const err9 = {instancePath:instancePath+"/args",schemaPath:"#/properties/args/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
else {
const err10 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
validate74.errors = vErrors;
return errors === 0;
}
validate74.evaluated = {"props":{"type":true,"call_id":true,"tool":true,"args":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema89 = {"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","call_id","tool","ok"],"properties":{"type":{"const":"tool_result","type":"string"},"call_id":{"type":"string"},"tool":{"type":"string"},"ok":{"type":"boolean"},"summary":{"type":"string"},"error":{"type":"string"}}};

function validate77(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate77.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.turn_id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "turn_id"},message:"must have required property '"+"turn_id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.call_id === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "call_id"},message:"must have required property '"+"call_id"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.tool === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "tool"},message:"must have required property '"+"tool"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.ok === undefined){
const err4 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "ok"},message:"must have required property '"+"ok"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err5 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if("tool_result" !== data0){
const err6 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "tool_result"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.call_id !== undefined){
if(typeof data.call_id !== "string"){
const err7 = {instancePath:instancePath+"/call_id",schemaPath:"#/properties/call_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.tool !== undefined){
if(typeof data.tool !== "string"){
const err8 = {instancePath:instancePath+"/tool",schemaPath:"#/properties/tool/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.ok !== undefined){
if(typeof data.ok !== "boolean"){
const err9 = {instancePath:instancePath+"/ok",schemaPath:"#/properties/ok/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.summary !== undefined){
if(typeof data.summary !== "string"){
const err10 = {instancePath:instancePath+"/summary",schemaPath:"#/properties/summary/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data.error !== undefined){
if(typeof data.error !== "string"){
const err11 = {instancePath:instancePath+"/error",schemaPath:"#/properties/error/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
validate77.errors = vErrors;
return errors === 0;
}
validate77.evaluated = {"props":{"type":true,"call_id":true,"tool":true,"ok":true,"summary":true,"error":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema90 = {"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","text","source"],"properties":{"type":{"const":"turn_started","type":"string"},"text":{"type":"string"},"source":{"type":"string","enum":["keyboard","voice","proactive","action"]}}};

function validate80(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate80.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.turn_id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "turn_id"},message:"must have required property '"+"turn_id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.text === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "text"},message:"must have required property '"+"text"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.source === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "source"},message:"must have required property '"+"source"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err4 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if("turn_started" !== data0){
const err5 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "turn_started"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.text !== undefined){
if(typeof data.text !== "string"){
const err6 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.source !== undefined){
let data2 = data.source;
if(typeof data2 !== "string"){
const err7 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(!((((data2 === "keyboard") || (data2 === "voice")) || (data2 === "proactive")) || (data2 === "action"))){
const err8 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/enum",keyword:"enum",params:{allowedValues: schema90.properties.source.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
}
else {
const err9 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
validate80.errors = vErrors;
return errors === 0;
}
validate80.evaluated = {"props":{"type":true,"text":true,"source":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema91 = {"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","status"],"properties":{"type":{"const":"turn_done","type":"string"},"status":{"type":"string","enum":["completed","cancelled","failed"]},"text":{"type":"string","description":"The full reply text for the transcript."},"modality":{"$ref":"#/$defs/Modality"}}};

function validate83(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate83.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.turn_id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "turn_id"},message:"must have required property '"+"turn_id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.status === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "status"},message:"must have required property '"+"status"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if("turn_done" !== data0){
const err4 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "turn_done"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.status !== undefined){
let data1 = data.status;
if(typeof data1 !== "string"){
const err5 = {instancePath:instancePath+"/status",schemaPath:"#/properties/status/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!(((data1 === "completed") || (data1 === "cancelled")) || (data1 === "failed"))){
const err6 = {instancePath:instancePath+"/status",schemaPath:"#/properties/status/enum",keyword:"enum",params:{allowedValues: schema91.properties.status.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.text !== undefined){
if(typeof data.text !== "string"){
const err7 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.modality !== undefined){
let data3 = data.modality;
if(typeof data3 !== "string"){
const err8 = {instancePath:instancePath+"/modality",schemaPath:"#/$defs/Modality/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(!(((((data3 === "none") || (data3 === "voice")) || (data3 === "glance")) || (data3 === "visual")) || (data3 === "both"))){
const err9 = {instancePath:instancePath+"/modality",schemaPath:"#/$defs/Modality/enum",keyword:"enum",params:{allowedValues: schema84.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
else {
const err10 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
validate83.errors = vErrors;
return errors === 0;
}
validate83.evaluated = {"props":{"type":true,"status":true,"text":true,"modality":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema93 = {"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","code","message"],"properties":{"type":{"const":"error","type":"string"},"code":{"type":"string"},"message":{"type":"string"},"fatal":{"type":"boolean","default":false}}};

function validate86(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate86.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.code === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "code"},message:"must have required property '"+"code"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.message === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "message"},message:"must have required property '"+"message"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if("error" !== data0){
const err4 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "error"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.code !== undefined){
if(typeof data.code !== "string"){
const err5 = {instancePath:instancePath+"/code",schemaPath:"#/properties/code/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.message !== undefined){
if(typeof data.message !== "string"){
const err6 = {instancePath:instancePath+"/message",schemaPath:"#/properties/message/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.fatal !== undefined){
if(typeof data.fatal !== "boolean"){
const err7 = {instancePath:instancePath+"/fatal",schemaPath:"#/properties/fatal/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
}
else {
const err8 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
validate86.errors = vErrors;
return errors === 0;
}
validate86.evaluated = {"props":{"type":true,"code":true,"message":true,"fatal":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema94 = {"description":"Something the agent put on screen unprompted (reminder, ambient card). The accompanying spec ops and speech follow as normal events with the same turn_id.","allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type","turn_id","source","title"],"properties":{"type":{"const":"proactive","type":"string"},"source":{"type":"string","enum":["reminder","ambient","runtime"]},"title":{"type":"string"}}};

function validate89(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate89.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.turn_id === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "turn_id"},message:"must have required property '"+"turn_id"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.source === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "source"},message:"must have required property '"+"source"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.title === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "title"},message:"must have required property '"+"title"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err4 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if("proactive" !== data0){
const err5 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "proactive"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.source !== undefined){
let data1 = data.source;
if(typeof data1 !== "string"){
const err6 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(!(((data1 === "reminder") || (data1 === "ambient")) || (data1 === "runtime"))){
const err7 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/enum",keyword:"enum",params:{allowedValues: schema94.properties.source.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.title !== undefined){
if(typeof data.title !== "string"){
const err8 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
}
else {
const err9 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
validate89.errors = vErrors;
return errors === 0;
}
validate89.evaluated = {"props":{"type":true,"source":true,"title":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};

const schema95 = {"allOf":[{"$ref":"#/$defs/Base"}],"type":"object","required":["type"],"properties":{"type":{"const":"heartbeat","type":"string"}}};

function validate92(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate92.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(!(validate52(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate52.errors : vErrors.concat(validate52.errors);
errors = vErrors.length;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.type === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "type"},message:"must have required property '"+"type"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.type !== undefined){
let data0 = data.type;
if(typeof data0 !== "string"){
const err1 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if("heartbeat" !== data0){
const err2 = {instancePath:instancePath+"/type",schemaPath:"#/properties/type/const",keyword:"const",params:{allowedValue: "heartbeat"},message:"must be equal to constant"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
}
else {
const err3 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
validate92.errors = vErrors;
return errors === 0;
}
validate92.evaluated = {"props":{"type":true,"seq":true,"ts":true,"turn_id":true},"dynamicProps":false,"dynamicItems":false};


function validate50(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/schema/events.schema.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate50.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
const _errs0 = errors;
let valid0 = false;
let passing0 = null;
const _errs1 = errors;
if(!(validate51(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate51.errors : vErrors.concat(validate51.errors);
errors = vErrors.length;
}
var _valid0 = _errs1 === errors;
if(_valid0){
valid0 = true;
passing0 = 0;
var props0 = {};
props0.type = true;
props0.session_id = true;
props0.agent_name = true;
props0.agent_state = true;
props0.spec = true;
props0.pending_proposals = true;
props0.capabilities = true;
props0.transcript = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
const _errs2 = errors;
if(!(validate58(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
errors = vErrors.length;
}
var _valid0 = _errs2 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 1];
}
else {
if(_valid0){
valid0 = true;
passing0 = 1;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.state = true;
props0.detail = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs3 = errors;
if(!(validate61(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate61.errors : vErrors.concat(validate61.errors);
errors = vErrors.length;
}
var _valid0 = _errs3 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 2];
}
else {
if(_valid0){
valid0 = true;
passing0 = 2;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.delta = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs4 = errors;
if(!(validate64(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate64.errors : vErrors.concat(validate64.errors);
errors = vErrors.length;
}
var _valid0 = _errs4 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 3];
}
else {
if(_valid0){
valid0 = true;
passing0 = 3;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.op = true;
props0.modality = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs5 = errors;
if(!(validate68(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate68.errors : vErrors.concat(validate68.errors);
errors = vErrors.length;
}
var _valid0 = _errs5 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 4];
}
else {
if(_valid0){
valid0 = true;
passing0 = 4;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.text = true;
props0.audio_url = true;
props0.final = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs6 = errors;
if(!(validate71(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate71.errors : vErrors.concat(validate71.errors);
errors = vErrors.length;
}
var _valid0 = _errs6 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 5];
}
else {
if(_valid0){
valid0 = true;
passing0 = 5;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.proposal = true;
props0.status = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs7 = errors;
if(!(validate74(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate74.errors : vErrors.concat(validate74.errors);
errors = vErrors.length;
}
var _valid0 = _errs7 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 6];
}
else {
if(_valid0){
valid0 = true;
passing0 = 6;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.call_id = true;
props0.tool = true;
props0.args = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs8 = errors;
if(!(validate77(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate77.errors : vErrors.concat(validate77.errors);
errors = vErrors.length;
}
var _valid0 = _errs8 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 7];
}
else {
if(_valid0){
valid0 = true;
passing0 = 7;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.call_id = true;
props0.tool = true;
props0.ok = true;
props0.summary = true;
props0.error = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs9 = errors;
if(!(validate80(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate80.errors : vErrors.concat(validate80.errors);
errors = vErrors.length;
}
var _valid0 = _errs9 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 8];
}
else {
if(_valid0){
valid0 = true;
passing0 = 8;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.text = true;
props0.source = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs10 = errors;
if(!(validate83(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate83.errors : vErrors.concat(validate83.errors);
errors = vErrors.length;
}
var _valid0 = _errs10 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 9];
}
else {
if(_valid0){
valid0 = true;
passing0 = 9;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.status = true;
props0.text = true;
props0.modality = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs11 = errors;
if(!(validate86(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate86.errors : vErrors.concat(validate86.errors);
errors = vErrors.length;
}
var _valid0 = _errs11 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 10];
}
else {
if(_valid0){
valid0 = true;
passing0 = 10;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.code = true;
props0.message = true;
props0.fatal = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs12 = errors;
if(!(validate89(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate89.errors : vErrors.concat(validate89.errors);
errors = vErrors.length;
}
var _valid0 = _errs12 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 11];
}
else {
if(_valid0){
valid0 = true;
passing0 = 11;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.source = true;
props0.title = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
const _errs13 = errors;
if(!(validate92(data, {instancePath,parentData,parentDataProperty,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate92.errors : vErrors.concat(validate92.errors);
errors = vErrors.length;
}
var _valid0 = _errs13 === errors;
if(_valid0 && valid0){
valid0 = false;
passing0 = [passing0, 12];
}
else {
if(_valid0){
valid0 = true;
passing0 = 12;
if(props0 !== true){
props0 = props0 || {};
props0.type = true;
props0.seq = true;
props0.ts = true;
props0.turn_id = true;
}
}
}
}
}
}
}
}
}
}
}
}
}
}
if(!valid0){
const err0 = {instancePath,schemaPath:"#/oneOf",keyword:"oneOf",params:{passingSchemas: passing0},message:"must match exactly one schema in oneOf"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
else {
errors = _errs0;
if(vErrors !== null){
if(_errs0){
vErrors.length = _errs0;
}
else {
vErrors = null;
}
}
}
validate50.errors = vErrors;
evaluated0.props = props0;
return errors === 0;
}
validate50.evaluated = {"dynamicProps":true,"dynamicItems":false};

export const validateCatalog = validate95;
const schema96 = {"$schema":"https://json-schema.org/draft/2020-12/schema","$id":"https://corellia.dev/schema/catalog.schema.json","title":"Catalog","description":"Shape of shared/catalog/catalog.json: the closed component catalog (VISION.md 5.1). It is the single source for the model-facing description, server validation and the client registry.","type":"object","additionalProperties":false,"required":["catalog_version","components"],"properties":{"catalog_version":{"type":"integer","minimum":1},"components":{"type":"object","propertyNames":{"pattern":"^[A-Z][A-Za-z0-9]{0,31}$"},"additionalProperties":{"$ref":"#/$defs/ComponentDef"}}},"$defs":{"Fit":{"description":"Size and fit hint. glance: small card readable across the room, panel: beside the agent, full: takes the screen.","type":"string","enum":["glance","panel","full"]},"ComponentDef":{"type":"object","additionalProperties":false,"required":["description","category","fit","props"],"properties":{"description":{"type":"string","minLength":1,"maxLength":400},"category":{"type":"string","enum":["layout","content","action","status"]},"fit":{"type":"array","items":{"$ref":"#/$defs/Fit"},"minItems":1},"props":{"description":"JSON Schema (object) for the props.","type":"object"},"bindable":{"description":"Prop names that accept a Binding instead of a literal.","type":"array","items":{"type":"string"},"default":[]},"slots":{"type":"object","propertyNames":{"pattern":"^[a-z][a-z0-9_]{0,31}$"},"additionalProperties":{"$ref":"#/$defs/SlotDef"}},"actions":{"description":"Action slot names the component can fire.","type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]{0,31}$"},"default":[]},"tags":{"description":"Content hints used by fit-ranking (for example `place`, `numeric`, `list`).","type":"array","items":{"type":"string"},"default":[]},"example":{"description":"A props example shown to the model.","type":"object"}}},"SlotDef":{"type":"object","additionalProperties":false,"required":["accepts"],"properties":{"description":{"type":"string"},"accepts":{"description":"Allowed child component types, or [\"*\"] for any.","type":"array","items":{"type":"string"},"minItems":1},"max":{"type":"integer","minimum":1,"maximum":64}}}}};
const schema97 = {"type":"object","additionalProperties":false,"required":["description","category","fit","props"],"properties":{"description":{"type":"string","minLength":1,"maxLength":400},"category":{"type":"string","enum":["layout","content","action","status"]},"fit":{"type":"array","items":{"$ref":"#/$defs/Fit"},"minItems":1},"props":{"description":"JSON Schema (object) for the props.","type":"object"},"bindable":{"description":"Prop names that accept a Binding instead of a literal.","type":"array","items":{"type":"string"},"default":[]},"slots":{"type":"object","propertyNames":{"pattern":"^[a-z][a-z0-9_]{0,31}$"},"additionalProperties":{"$ref":"#/$defs/SlotDef"}},"actions":{"description":"Action slot names the component can fire.","type":"array","items":{"type":"string","pattern":"^[a-z][a-z0-9_]{0,31}$"},"default":[]},"tags":{"description":"Content hints used by fit-ranking (for example `place`, `numeric`, `list`).","type":"array","items":{"type":"string"},"default":[]},"example":{"description":"A props example shown to the model.","type":"object"}}};
const schema98 = {"description":"Size and fit hint. glance: small card readable across the room, panel: beside the agent, full: takes the screen.","type":"string","enum":["glance","panel","full"]};
const schema99 = {"type":"object","additionalProperties":false,"required":["accepts"],"properties":{"description":{"type":"string"},"accepts":{"description":"Allowed child component types, or [\"*\"] for any.","type":"array","items":{"type":"string"},"minItems":1},"max":{"type":"integer","minimum":1,"maximum":64}}};
const func5 = Object.prototype.hasOwnProperty;

function validate96(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate96.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.description === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "description"},message:"must have required property '"+"description"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.category === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "category"},message:"must have required property '"+"category"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data.fit === undefined){
const err2 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "fit"},message:"must have required property '"+"fit"+"'"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data.props === undefined){
const err3 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "props"},message:"must have required property '"+"props"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key0 in data){
if(!(func5.call(schema97.properties, key0))){
const err4 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.description !== undefined){
let data0 = data.description;
if(typeof data0 === "string"){
if(func1(data0) > 400){
const err5 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/maxLength",keyword:"maxLength",params:{limit: 400},message:"must NOT have more than 400 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(func1(data0) < 1){
const err6 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/description",schemaPath:"#/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.category !== undefined){
let data1 = data.category;
if(typeof data1 !== "string"){
const err8 = {instancePath:instancePath+"/category",schemaPath:"#/properties/category/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(!((((data1 === "layout") || (data1 === "content")) || (data1 === "action")) || (data1 === "status"))){
const err9 = {instancePath:instancePath+"/category",schemaPath:"#/properties/category/enum",keyword:"enum",params:{allowedValues: schema97.properties.category.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.fit !== undefined){
let data2 = data.fit;
if(Array.isArray(data2)){
if(data2.length < 1){
const err10 = {instancePath:instancePath+"/fit",schemaPath:"#/properties/fit/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
const len0 = data2.length;
for(let i0=0; i0<len0; i0++){
let data3 = data2[i0];
if(typeof data3 !== "string"){
const err11 = {instancePath:instancePath+"/fit/" + i0,schemaPath:"#/$defs/Fit/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
if(!(((data3 === "glance") || (data3 === "panel")) || (data3 === "full"))){
const err12 = {instancePath:instancePath+"/fit/" + i0,schemaPath:"#/$defs/Fit/enum",keyword:"enum",params:{allowedValues: schema98.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
else {
const err13 = {instancePath:instancePath+"/fit",schemaPath:"#/properties/fit/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.props !== undefined){
let data4 = data.props;
if(!(data4 && typeof data4 == "object" && !Array.isArray(data4))){
const err14 = {instancePath:instancePath+"/props",schemaPath:"#/properties/props/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
if(data.bindable !== undefined){
let data5 = data.bindable;
if(Array.isArray(data5)){
const len1 = data5.length;
for(let i1=0; i1<len1; i1++){
if(typeof data5[i1] !== "string"){
const err15 = {instancePath:instancePath+"/bindable/" + i1,schemaPath:"#/properties/bindable/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
}
else {
const err16 = {instancePath:instancePath+"/bindable",schemaPath:"#/properties/bindable/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data.slots !== undefined){
let data7 = data.slots;
if(data7 && typeof data7 == "object" && !Array.isArray(data7)){
for(const key1 in data7){
const _errs19 = errors;
if(typeof key1 === "string"){
if(!pattern8.test(key1)){
const err17 = {instancePath:instancePath+"/slots",schemaPath:"#/properties/slots/propertyNames/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]{0,31}$"},message:"must match pattern \""+"^[a-z][a-z0-9_]{0,31}$"+"\"",propertyName:key1};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
var valid6 = _errs19 === errors;
if(!valid6){
const err18 = {instancePath:instancePath+"/slots",schemaPath:"#/properties/slots/propertyNames",keyword:"propertyNames",params:{propertyName: key1},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
for(const key2 in data7){
let data8 = data7[key2];
if(data8 && typeof data8 == "object" && !Array.isArray(data8)){
if(data8.accepts === undefined){
const err19 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/SlotDef/required",keyword:"required",params:{missingProperty: "accepts"},message:"must have required property '"+"accepts"+"'"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
for(const key3 in data8){
if(!(((key3 === "description") || (key3 === "accepts")) || (key3 === "max"))){
const err20 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/SlotDef/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key3},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
if(data8.description !== undefined){
if(typeof data8.description !== "string"){
const err21 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/description",schemaPath:"#/$defs/SlotDef/properties/description/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data8.accepts !== undefined){
let data10 = data8.accepts;
if(Array.isArray(data10)){
if(data10.length < 1){
const err22 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/accepts",schemaPath:"#/$defs/SlotDef/properties/accepts/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
const len2 = data10.length;
for(let i2=0; i2<len2; i2++){
if(typeof data10[i2] !== "string"){
const err23 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/accepts/" + i2,schemaPath:"#/$defs/SlotDef/properties/accepts/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
else {
const err24 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/accepts",schemaPath:"#/$defs/SlotDef/properties/accepts/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
if(data8.max !== undefined){
let data12 = data8.max;
if(!((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12)))){
const err25 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/max",schemaPath:"#/$defs/SlotDef/properties/max/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
if(typeof data12 == "number"){
if(data12 > 64 || isNaN(data12)){
const err26 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/max",schemaPath:"#/$defs/SlotDef/properties/max/maximum",keyword:"maximum",params:{comparison: "<=", limit: 64},message:"must be <= 64"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
if(data12 < 1 || isNaN(data12)){
const err27 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1")+"/max",schemaPath:"#/$defs/SlotDef/properties/max/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
}
else {
const err28 = {instancePath:instancePath+"/slots/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/$defs/SlotDef/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
}
}
else {
const err29 = {instancePath:instancePath+"/slots",schemaPath:"#/properties/slots/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err29];
}
else {
vErrors.push(err29);
}
errors++;
}
}
if(data.actions !== undefined){
let data13 = data.actions;
if(Array.isArray(data13)){
const len3 = data13.length;
for(let i3=0; i3<len3; i3++){
let data14 = data13[i3];
if(typeof data14 === "string"){
if(!pattern8.test(data14)){
const err30 = {instancePath:instancePath+"/actions/" + i3,schemaPath:"#/properties/actions/items/pattern",keyword:"pattern",params:{pattern: "^[a-z][a-z0-9_]{0,31}$"},message:"must match pattern \""+"^[a-z][a-z0-9_]{0,31}$"+"\""};
if(vErrors === null){
vErrors = [err30];
}
else {
vErrors.push(err30);
}
errors++;
}
}
else {
const err31 = {instancePath:instancePath+"/actions/" + i3,schemaPath:"#/properties/actions/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err31];
}
else {
vErrors.push(err31);
}
errors++;
}
}
}
else {
const err32 = {instancePath:instancePath+"/actions",schemaPath:"#/properties/actions/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err32];
}
else {
vErrors.push(err32);
}
errors++;
}
}
if(data.tags !== undefined){
let data15 = data.tags;
if(Array.isArray(data15)){
const len4 = data15.length;
for(let i4=0; i4<len4; i4++){
if(typeof data15[i4] !== "string"){
const err33 = {instancePath:instancePath+"/tags/" + i4,schemaPath:"#/properties/tags/items/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err33];
}
else {
vErrors.push(err33);
}
errors++;
}
}
}
else {
const err34 = {instancePath:instancePath+"/tags",schemaPath:"#/properties/tags/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err34];
}
else {
vErrors.push(err34);
}
errors++;
}
}
if(data.example !== undefined){
let data17 = data.example;
if(!(data17 && typeof data17 == "object" && !Array.isArray(data17))){
const err35 = {instancePath:instancePath+"/example",schemaPath:"#/properties/example/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err35];
}
else {
vErrors.push(err35);
}
errors++;
}
}
}
else {
const err36 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err36];
}
else {
vErrors.push(err36);
}
errors++;
}
validate96.errors = vErrors;
return errors === 0;
}
validate96.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};


function validate95(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/schema/catalog.schema.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate95.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.catalog_version === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "catalog_version"},message:"must have required property '"+"catalog_version"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.components === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "components"},message:"must have required property '"+"components"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "catalog_version") || (key0 === "components"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.catalog_version !== undefined){
let data0 = data.catalog_version;
if(!((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0)))){
const err3 = {instancePath:instancePath+"/catalog_version",schemaPath:"#/properties/catalog_version/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(typeof data0 == "number"){
if(data0 < 1 || isNaN(data0)){
const err4 = {instancePath:instancePath+"/catalog_version",schemaPath:"#/properties/catalog_version/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
}
if(data.components !== undefined){
let data1 = data.components;
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
for(const key1 in data1){
const _errs6 = errors;
if(typeof key1 === "string"){
if(!pattern6.test(key1)){
const err5 = {instancePath:instancePath+"/components",schemaPath:"#/properties/components/propertyNames/pattern",keyword:"pattern",params:{pattern: "^[A-Z][A-Za-z0-9]{0,31}$"},message:"must match pattern \""+"^[A-Z][A-Za-z0-9]{0,31}$"+"\"",propertyName:key1};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
var valid1 = _errs6 === errors;
if(!valid1){
const err6 = {instancePath:instancePath+"/components",schemaPath:"#/properties/components/propertyNames",keyword:"propertyNames",params:{propertyName: key1},message:"property name must be valid"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
for(const key2 in data1){
if(!(validate96(data1[key2], {instancePath:instancePath+"/components/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),parentData:data1,parentDataProperty:key2,rootData,dynamicAnchors}))){
vErrors = vErrors === null ? validate96.errors : vErrors.concat(validate96.errors);
errors = vErrors.length;
}
}
}
else {
const err7 = {instancePath:instancePath+"/components",schemaPath:"#/properties/components/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
}
else {
const err8 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
validate95.errors = vErrors;
return errors === 0;
}
validate95.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateApi_TurnRequest = validate99;
const schema101 = {"type":"object","additionalProperties":false,"required":["text"],"properties":{"text":{"type":"string","minLength":1,"maxLength":8000},"source":{"type":"string","enum":["keyboard","voice"],"default":"keyboard"},"client_turn_id":{"type":"string","maxLength":64,"description":"Optional idempotency key chosen by the client."}}};

function validate99(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate99.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.text === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "text"},message:"must have required property '"+"text"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "text") || (key0 === "source")) || (key0 === "client_turn_id"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.text !== undefined){
let data0 = data.text;
if(typeof data0 === "string"){
if(func1(data0) > 8000){
const err2 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/maxLength",keyword:"maxLength",params:{limit: 8000},message:"must NOT have more than 8000 characters"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(func1(data0) < 1){
const err3 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/minLength",keyword:"minLength",params:{limit: 1},message:"must NOT have fewer than 1 characters"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.source !== undefined){
let data1 = data.source;
if(typeof data1 !== "string"){
const err5 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!((data1 === "keyboard") || (data1 === "voice"))){
const err6 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/enum",keyword:"enum",params:{allowedValues: schema101.properties.source.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data.client_turn_id !== undefined){
let data2 = data.client_turn_id;
if(typeof data2 === "string"){
if(func1(data2) > 64){
const err7 = {instancePath:instancePath+"/client_turn_id",schemaPath:"#/properties/client_turn_id/maxLength",keyword:"maxLength",params:{limit: 64},message:"must NOT have more than 64 characters"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/client_turn_id",schemaPath:"#/properties/client_turn_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
}
else {
const err9 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
validate99.errors = vErrors;
return errors === 0;
}
validate99.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateApi_TurnResponse = validate100;
const schema102 = {"type":"object","required":["turn_id"],"properties":{"turn_id":{"type":"string"},"cancelled_turn_id":{"type":"string","description":"Set when starting this turn cancelled a running one."},"handled":{"type":"string","enum":["turn","confirmed","rejected"],"description":"`turn` when a runtime turn started; `confirmed`/`rejected` when the text was a confirmation phrase applied to the pending proposal instead."},"proposal_id":{"type":"string","description":"Set with `confirmed`/`rejected`."}}};

function validate100(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate100.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.turn_id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "turn_id"},message:"must have required property '"+"turn_id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.turn_id !== undefined){
if(typeof data.turn_id !== "string"){
const err1 = {instancePath:instancePath+"/turn_id",schemaPath:"#/properties/turn_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.cancelled_turn_id !== undefined){
if(typeof data.cancelled_turn_id !== "string"){
const err2 = {instancePath:instancePath+"/cancelled_turn_id",schemaPath:"#/properties/cancelled_turn_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.handled !== undefined){
let data2 = data.handled;
if(typeof data2 !== "string"){
const err3 = {instancePath:instancePath+"/handled",schemaPath:"#/properties/handled/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(!(((data2 === "turn") || (data2 === "confirmed")) || (data2 === "rejected"))){
const err4 = {instancePath:instancePath+"/handled",schemaPath:"#/properties/handled/enum",keyword:"enum",params:{allowedValues: schema102.properties.handled.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.proposal_id !== undefined){
if(typeof data.proposal_id !== "string"){
const err5 = {instancePath:instancePath+"/proposal_id",schemaPath:"#/properties/proposal_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
validate100.errors = vErrors;
return errors === 0;
}
validate100.evaluated = {"props":{"turn_id":true,"cancelled_turn_id":true,"handled":true,"proposal_id":true},"dynamicProps":false,"dynamicItems":false};

export const validateApi_CancelRequest = validate101;
const schema103 = {"type":"object","additionalProperties":false,"properties":{"turn_id":{"type":"string","description":"Omit to cancel whatever is running."}}};

function validate101(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate101.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
for(const key0 in data){
if(!(key0 === "turn_id")){
const err0 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
if(data.turn_id !== undefined){
if(typeof data.turn_id !== "string"){
const err1 = {instancePath:instancePath+"/turn_id",schemaPath:"#/properties/turn_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
}
else {
const err2 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
validate101.errors = vErrors;
return errors === 0;
}
validate101.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateApi_ConfirmRequest = validate102;
const schema104 = {"type":"object","additionalProperties":false,"required":["proposal_id"],"properties":{"proposal_id":{"type":"string"},"source":{"type":"string","enum":["keyboard","voice"],"default":"keyboard"}}};

function validate102(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate102.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.proposal_id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "proposal_id"},message:"must have required property '"+"proposal_id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "proposal_id") || (key0 === "source"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.proposal_id !== undefined){
if(typeof data.proposal_id !== "string"){
const err2 = {instancePath:instancePath+"/proposal_id",schemaPath:"#/properties/proposal_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.source !== undefined){
let data1 = data.source;
if(typeof data1 !== "string"){
const err3 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(!((data1 === "keyboard") || (data1 === "voice"))){
const err4 = {instancePath:instancePath+"/source",schemaPath:"#/properties/source/enum",keyword:"enum",params:{allowedValues: schema104.properties.source.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
}
else {
const err5 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
validate102.errors = vErrors;
return errors === 0;
}
validate102.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateApi_ActionRequest = validate103;
const schema105 = {"description":"The client fired a node action.","type":"object","additionalProperties":false,"required":["action_id"],"properties":{"action_id":{"type":"string"},"node_id":{"type":"string"}}};

function validate103(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate103.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.action_id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "action_id"},message:"must have required property '"+"action_id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "action_id") || (key0 === "node_id"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.action_id !== undefined){
if(typeof data.action_id !== "string"){
const err2 = {instancePath:instancePath+"/action_id",schemaPath:"#/properties/action_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.node_id !== undefined){
if(typeof data.node_id !== "string"){
const err3 = {instancePath:instancePath+"/node_id",schemaPath:"#/properties/node_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
}
else {
const err4 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
validate103.errors = vErrors;
return errors === 0;
}
validate103.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateApi_ErrorResponse = validate104;
const schema106 = {"type":"object","required":["error"],"properties":{"error":{"type":"string"},"code":{"type":"string"}}};

function validate104(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
let vErrors = null;
let errors = 0;
const evaluated0 = validate104.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.error === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "error"},message:"must have required property '"+"error"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.error !== undefined){
if(typeof data.error !== "string"){
const err1 = {instancePath:instancePath+"/error",schemaPath:"#/properties/error/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.code !== undefined){
if(typeof data.code !== "string"){
const err2 = {instancePath:instancePath+"/code",schemaPath:"#/properties/code/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
}
else {
const err3 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
validate104.errors = vErrors;
return errors === 0;
}
validate104.evaluated = {"props":{"error":true,"code":true},"dynamicProps":false,"dynamicItems":false};

export const validateProps_Stack = validate105;
const schema113 = {"$id":"https://corellia.dev/catalog/props/Stack.json","type":"object","additionalProperties":false,"properties":{"direction":{"type":"string","enum":["column","row"],"default":"column"},"gap":{"type":"string","enum":["none","sm","md","lg"],"default":"md"},"align":{"type":"string","enum":["start","center","end","stretch"],"default":"stretch"}}};

function validate105(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Stack.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate105.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
for(const key0 in data){
if(!(((key0 === "direction") || (key0 === "gap")) || (key0 === "align"))){
const err0 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
if(data.direction !== undefined){
let data0 = data.direction;
if(typeof data0 !== "string"){
const err1 = {instancePath:instancePath+"/direction",schemaPath:"#/properties/direction/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(!((data0 === "column") || (data0 === "row"))){
const err2 = {instancePath:instancePath+"/direction",schemaPath:"#/properties/direction/enum",keyword:"enum",params:{allowedValues: schema113.properties.direction.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.gap !== undefined){
let data1 = data.gap;
if(typeof data1 !== "string"){
const err3 = {instancePath:instancePath+"/gap",schemaPath:"#/properties/gap/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(!((((data1 === "none") || (data1 === "sm")) || (data1 === "md")) || (data1 === "lg"))){
const err4 = {instancePath:instancePath+"/gap",schemaPath:"#/properties/gap/enum",keyword:"enum",params:{allowedValues: schema113.properties.gap.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.align !== undefined){
let data2 = data.align;
if(typeof data2 !== "string"){
const err5 = {instancePath:instancePath+"/align",schemaPath:"#/properties/align/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!((((data2 === "start") || (data2 === "center")) || (data2 === "end")) || (data2 === "stretch"))){
const err6 = {instancePath:instancePath+"/align",schemaPath:"#/properties/align/enum",keyword:"enum",params:{allowedValues: schema113.properties.align.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
else {
const err7 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
validate105.errors = vErrors;
return errors === 0;
}
validate105.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Grid = validate106;
const schema114 = {"$id":"https://corellia.dev/catalog/props/Grid.json","type":"object","additionalProperties":false,"properties":{"columns":{"type":"integer","minimum":1,"maximum":6,"default":2},"gap":{"type":"string","enum":["none","sm","md","lg"],"default":"md"}}};

function validate106(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Grid.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate106.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
for(const key0 in data){
if(!((key0 === "columns") || (key0 === "gap"))){
const err0 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
if(data.columns !== undefined){
let data0 = data.columns;
if(!((typeof data0 == "number") && (!(data0 % 1) && !isNaN(data0)))){
const err1 = {instancePath:instancePath+"/columns",schemaPath:"#/properties/columns/type",keyword:"type",params:{type: "integer"},message:"must be integer"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(typeof data0 == "number"){
if(data0 > 6 || isNaN(data0)){
const err2 = {instancePath:instancePath+"/columns",schemaPath:"#/properties/columns/maximum",keyword:"maximum",params:{comparison: "<=", limit: 6},message:"must be <= 6"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data0 < 1 || isNaN(data0)){
const err3 = {instancePath:instancePath+"/columns",schemaPath:"#/properties/columns/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
}
if(data.gap !== undefined){
let data1 = data.gap;
if(typeof data1 !== "string"){
const err4 = {instancePath:instancePath+"/gap",schemaPath:"#/properties/gap/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(!((((data1 === "none") || (data1 === "sm")) || (data1 === "md")) || (data1 === "lg"))){
const err5 = {instancePath:instancePath+"/gap",schemaPath:"#/properties/gap/enum",keyword:"enum",params:{allowedValues: schema114.properties.gap.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
validate106.errors = vErrors;
return errors === 0;
}
validate106.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Split = validate107;
const schema115 = {"$id":"https://corellia.dev/catalog/props/Split.json","type":"object","additionalProperties":false,"properties":{"ratio":{"type":"number","minimum":0.2,"maximum":0.8,"default":0.6},"direction":{"type":"string","enum":["row","column"],"default":"row"}}};

function validate107(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Split.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate107.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
for(const key0 in data){
if(!((key0 === "ratio") || (key0 === "direction"))){
const err0 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
if(data.ratio !== undefined){
let data0 = data.ratio;
if(typeof data0 == "number"){
if(data0 > 0.8 || isNaN(data0)){
const err1 = {instancePath:instancePath+"/ratio",schemaPath:"#/properties/ratio/maximum",keyword:"maximum",params:{comparison: "<=", limit: 0.8},message:"must be <= 0.8"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(data0 < 0.2 || isNaN(data0)){
const err2 = {instancePath:instancePath+"/ratio",schemaPath:"#/properties/ratio/minimum",keyword:"minimum",params:{comparison: ">=", limit: 0.2},message:"must be >= 0.2"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
else {
const err3 = {instancePath:instancePath+"/ratio",schemaPath:"#/properties/ratio/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.direction !== undefined){
let data1 = data.direction;
if(typeof data1 !== "string"){
const err4 = {instancePath:instancePath+"/direction",schemaPath:"#/properties/direction/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(!((data1 === "row") || (data1 === "column"))){
const err5 = {instancePath:instancePath+"/direction",schemaPath:"#/properties/direction/enum",keyword:"enum",params:{allowedValues: schema115.properties.direction.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
validate107.errors = vErrors;
return errors === 0;
}
validate107.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Overlay = validate108;
const schema116 = {"$id":"https://corellia.dev/catalog/props/Overlay.json","type":"object","additionalProperties":false,"properties":{"position":{"type":"string","enum":["top_left","top_right","bottom_left","bottom_right","center"],"default":"top_right"},"dim":{"type":"boolean","default":false}}};

function validate108(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Overlay.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate108.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
for(const key0 in data){
if(!((key0 === "position") || (key0 === "dim"))){
const err0 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
if(data.position !== undefined){
let data0 = data.position;
if(typeof data0 !== "string"){
const err1 = {instancePath:instancePath+"/position",schemaPath:"#/properties/position/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
if(!(((((data0 === "top_left") || (data0 === "top_right")) || (data0 === "bottom_left")) || (data0 === "bottom_right")) || (data0 === "center"))){
const err2 = {instancePath:instancePath+"/position",schemaPath:"#/properties/position/enum",keyword:"enum",params:{allowedValues: schema116.properties.position.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.dim !== undefined){
if(typeof data.dim !== "boolean"){
const err3 = {instancePath:instancePath+"/dim",schemaPath:"#/properties/dim/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
}
else {
const err4 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
validate108.errors = vErrors;
return errors === 0;
}
validate108.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Card = validate109;
const schema117 = {"$id":"https://corellia.dev/catalog/props/Card.json","type":"object","additionalProperties":false,"properties":{"title":{"type":"string","maxLength":120},"subtitle":{"type":"string","maxLength":200},"accent":{"type":"string","enum":["none","primary","cyan","violet","blue","rose","amber"],"default":"none"}}};

function validate109(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Card.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate109.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
for(const key0 in data){
if(!(((key0 === "title") || (key0 === "subtitle")) || (key0 === "accent"))){
const err0 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
}
if(data.title !== undefined){
let data0 = data.title;
if(typeof data0 === "string"){
if(func1(data0) > 120){
const err1 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
else {
const err2 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.subtitle !== undefined){
let data1 = data.subtitle;
if(typeof data1 === "string"){
if(func1(data1) > 200){
const err3 = {instancePath:instancePath+"/subtitle",schemaPath:"#/properties/subtitle/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/subtitle",schemaPath:"#/properties/subtitle/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.accent !== undefined){
let data2 = data.accent;
if(typeof data2 !== "string"){
const err5 = {instancePath:instancePath+"/accent",schemaPath:"#/properties/accent/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(!(((((((data2 === "none") || (data2 === "primary")) || (data2 === "cyan")) || (data2 === "violet")) || (data2 === "blue")) || (data2 === "rose")) || (data2 === "amber"))){
const err6 = {instancePath:instancePath+"/accent",schemaPath:"#/properties/accent/enum",keyword:"enum",params:{allowedValues: schema117.properties.accent.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
}
else {
const err7 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
validate109.errors = vErrors;
return errors === 0;
}
validate109.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Markdown = validate110;
const schema118 = {"$id":"https://corellia.dev/catalog/props/Markdown.json","type":"object","additionalProperties":false,"required":["text"],"properties":{"text":{"type":"string","maxLength":8000},"size":{"type":"string","enum":["sm","md","lg"],"default":"md"}}};

function validate110(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Markdown.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate110.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.text === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "text"},message:"must have required property '"+"text"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "text") || (key0 === "size"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.text !== undefined){
let data0 = data.text;
if(typeof data0 === "string"){
if(func1(data0) > 8000){
const err2 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/maxLength",keyword:"maxLength",params:{limit: 8000},message:"must NOT have more than 8000 characters"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
else {
const err3 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.size !== undefined){
let data1 = data.size;
if(typeof data1 !== "string"){
const err4 = {instancePath:instancePath+"/size",schemaPath:"#/properties/size/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
if(!(((data1 === "sm") || (data1 === "md")) || (data1 === "lg"))){
const err5 = {instancePath:instancePath+"/size",schemaPath:"#/properties/size/enum",keyword:"enum",params:{allowedValues: schema118.properties.size.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
validate110.errors = vErrors;
return errors === 0;
}
validate110.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Stat = validate111;
const schema119 = {"$id":"https://corellia.dev/catalog/props/Stat.json","type":"object","additionalProperties":false,"required":["label","value"],"properties":{"label":{"type":"string","maxLength":60},"value":{"type":["string","number"]},"unit":{"type":"string","maxLength":16},"delta":{"type":"string","maxLength":32},"trend":{"type":"string","enum":["up","down","flat"]}}};

function validate111(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Stat.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate111.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.label === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.value === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "value"},message:"must have required property '"+"value"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!(((((key0 === "label") || (key0 === "value")) || (key0 === "unit")) || (key0 === "delta")) || (key0 === "trend"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.label !== undefined){
let data0 = data.label;
if(typeof data0 === "string"){
if(func1(data0) > 60){
const err3 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/maxLength",keyword:"maxLength",params:{limit: 60},message:"must NOT have more than 60 characters"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
else {
const err4 = {instancePath:instancePath+"/label",schemaPath:"#/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.value !== undefined){
let data1 = data.value;
if((typeof data1 !== "string") && (!(typeof data1 == "number"))){
const err5 = {instancePath:instancePath+"/value",schemaPath:"#/properties/value/type",keyword:"type",params:{type: schema119.properties.value.type},message:"must be string,number"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.unit !== undefined){
let data2 = data.unit;
if(typeof data2 === "string"){
if(func1(data2) > 16){
const err6 = {instancePath:instancePath+"/unit",schemaPath:"#/properties/unit/maxLength",keyword:"maxLength",params:{limit: 16},message:"must NOT have more than 16 characters"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/unit",schemaPath:"#/properties/unit/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.delta !== undefined){
let data3 = data.delta;
if(typeof data3 === "string"){
if(func1(data3) > 32){
const err8 = {instancePath:instancePath+"/delta",schemaPath:"#/properties/delta/maxLength",keyword:"maxLength",params:{limit: 32},message:"must NOT have more than 32 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/delta",schemaPath:"#/properties/delta/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data.trend !== undefined){
let data4 = data.trend;
if(typeof data4 !== "string"){
const err10 = {instancePath:instancePath+"/trend",schemaPath:"#/properties/trend/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
if(!(((data4 === "up") || (data4 === "down")) || (data4 === "flat"))){
const err11 = {instancePath:instancePath+"/trend",schemaPath:"#/properties/trend/enum",keyword:"enum",params:{allowedValues: schema119.properties.trend.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
validate111.errors = vErrors;
return errors === 0;
}
validate111.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_List = validate112;
const schema120 = {"$id":"https://corellia.dev/catalog/props/List.json","type":"object","additionalProperties":false,"required":["items"],"properties":{"items":{"type":"array","maxItems":50,"items":{"type":"object","additionalProperties":false,"required":["title"],"properties":{"title":{"type":"string","maxLength":200},"subtitle":{"type":"string","maxLength":300},"icon":{"type":"string","enum":["dot","check","clock","pin","alert","star"]},"done":{"type":"boolean"}}}},"ordered":{"type":"boolean","default":false}}};

function validate112(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/List.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate112.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.items === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "items"},message:"must have required property '"+"items"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "items") || (key0 === "ordered"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.items !== undefined){
let data0 = data.items;
if(Array.isArray(data0)){
if(data0.length > 50){
const err2 = {instancePath:instancePath+"/items",schemaPath:"#/properties/items/maxItems",keyword:"maxItems",params:{limit: 50},message:"must NOT have more than 50 items"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
let data1 = data0[i0];
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
if(data1.title === undefined){
const err3 = {instancePath:instancePath+"/items/" + i0,schemaPath:"#/properties/items/items/required",keyword:"required",params:{missingProperty: "title"},message:"must have required property '"+"title"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
for(const key1 in data1){
if(!((((key1 === "title") || (key1 === "subtitle")) || (key1 === "icon")) || (key1 === "done"))){
const err4 = {instancePath:instancePath+"/items/" + i0,schemaPath:"#/properties/items/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data1.title !== undefined){
let data2 = data1.title;
if(typeof data2 === "string"){
if(func1(data2) > 200){
const err5 = {instancePath:instancePath+"/items/" + i0+"/title",schemaPath:"#/properties/items/items/properties/title/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
else {
const err6 = {instancePath:instancePath+"/items/" + i0+"/title",schemaPath:"#/properties/items/items/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
if(data1.subtitle !== undefined){
let data3 = data1.subtitle;
if(typeof data3 === "string"){
if(func1(data3) > 300){
const err7 = {instancePath:instancePath+"/items/" + i0+"/subtitle",schemaPath:"#/properties/items/items/properties/subtitle/maxLength",keyword:"maxLength",params:{limit: 300},message:"must NOT have more than 300 characters"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/items/" + i0+"/subtitle",schemaPath:"#/properties/items/items/properties/subtitle/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data1.icon !== undefined){
let data4 = data1.icon;
if(typeof data4 !== "string"){
const err9 = {instancePath:instancePath+"/items/" + i0+"/icon",schemaPath:"#/properties/items/items/properties/icon/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
if(!((((((data4 === "dot") || (data4 === "check")) || (data4 === "clock")) || (data4 === "pin")) || (data4 === "alert")) || (data4 === "star"))){
const err10 = {instancePath:instancePath+"/items/" + i0+"/icon",schemaPath:"#/properties/items/items/properties/icon/enum",keyword:"enum",params:{allowedValues: schema120.properties.items.items.properties.icon.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
if(data1.done !== undefined){
if(typeof data1.done !== "boolean"){
const err11 = {instancePath:instancePath+"/items/" + i0+"/done",schemaPath:"#/properties/items/items/properties/done/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
}
else {
const err12 = {instancePath:instancePath+"/items/" + i0,schemaPath:"#/properties/items/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
}
}
else {
const err13 = {instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
if(data.ordered !== undefined){
if(typeof data.ordered !== "boolean"){
const err14 = {instancePath:instancePath+"/ordered",schemaPath:"#/properties/ordered/type",keyword:"type",params:{type: "boolean"},message:"must be boolean"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
else {
const err15 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
validate112.errors = vErrors;
return errors === 0;
}
validate112.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Table = validate113;
const schema121 = {"$id":"https://corellia.dev/catalog/props/Table.json","type":"object","additionalProperties":false,"required":["columns","rows"],"properties":{"columns":{"type":"array","minItems":1,"maxItems":12,"items":{"type":"object","additionalProperties":false,"required":["key","label"],"properties":{"key":{"type":"string","pattern":"^[A-Za-z_][A-Za-z0-9_]{0,31}$"},"label":{"type":"string","maxLength":60},"align":{"type":"string","enum":["left","right","center"],"default":"left"}}}},"rows":{"type":"array","maxItems":200,"items":{"type":"object","additionalProperties":{"type":["string","number","boolean","null"]}}},"caption":{"type":"string","maxLength":200}}};
const pattern36 = new RegExp("^[A-Za-z_][A-Za-z0-9_]{0,31}$", "u");

function validate113(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Table.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate113.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.columns === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "columns"},message:"must have required property '"+"columns"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.rows === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "rows"},message:"must have required property '"+"rows"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "columns") || (key0 === "rows")) || (key0 === "caption"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.columns !== undefined){
let data0 = data.columns;
if(Array.isArray(data0)){
if(data0.length > 12){
const err3 = {instancePath:instancePath+"/columns",schemaPath:"#/properties/columns/maxItems",keyword:"maxItems",params:{limit: 12},message:"must NOT have more than 12 items"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data0.length < 1){
const err4 = {instancePath:instancePath+"/columns",schemaPath:"#/properties/columns/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
let data1 = data0[i0];
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
if(data1.key === undefined){
const err5 = {instancePath:instancePath+"/columns/" + i0,schemaPath:"#/properties/columns/items/required",keyword:"required",params:{missingProperty: "key"},message:"must have required property '"+"key"+"'"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data1.label === undefined){
const err6 = {instancePath:instancePath+"/columns/" + i0,schemaPath:"#/properties/columns/items/required",keyword:"required",params:{missingProperty: "label"},message:"must have required property '"+"label"+"'"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
for(const key1 in data1){
if(!(((key1 === "key") || (key1 === "label")) || (key1 === "align"))){
const err7 = {instancePath:instancePath+"/columns/" + i0,schemaPath:"#/properties/columns/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data1.key !== undefined){
let data2 = data1.key;
if(typeof data2 === "string"){
if(!pattern36.test(data2)){
const err8 = {instancePath:instancePath+"/columns/" + i0+"/key",schemaPath:"#/properties/columns/items/properties/key/pattern",keyword:"pattern",params:{pattern: "^[A-Za-z_][A-Za-z0-9_]{0,31}$"},message:"must match pattern \""+"^[A-Za-z_][A-Za-z0-9_]{0,31}$"+"\""};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/columns/" + i0+"/key",schemaPath:"#/properties/columns/items/properties/key/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data1.label !== undefined){
let data3 = data1.label;
if(typeof data3 === "string"){
if(func1(data3) > 60){
const err10 = {instancePath:instancePath+"/columns/" + i0+"/label",schemaPath:"#/properties/columns/items/properties/label/maxLength",keyword:"maxLength",params:{limit: 60},message:"must NOT have more than 60 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/columns/" + i0+"/label",schemaPath:"#/properties/columns/items/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data1.align !== undefined){
let data4 = data1.align;
if(typeof data4 !== "string"){
const err12 = {instancePath:instancePath+"/columns/" + i0+"/align",schemaPath:"#/properties/columns/items/properties/align/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!(((data4 === "left") || (data4 === "right")) || (data4 === "center"))){
const err13 = {instancePath:instancePath+"/columns/" + i0+"/align",schemaPath:"#/properties/columns/items/properties/align/enum",keyword:"enum",params:{allowedValues: schema121.properties.columns.items.properties.align.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath:instancePath+"/columns/" + i0,schemaPath:"#/properties/columns/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
else {
const err15 = {instancePath:instancePath+"/columns",schemaPath:"#/properties/columns/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data.rows !== undefined){
let data5 = data.rows;
if(Array.isArray(data5)){
if(data5.length > 200){
const err16 = {instancePath:instancePath+"/rows",schemaPath:"#/properties/rows/maxItems",keyword:"maxItems",params:{limit: 200},message:"must NOT have more than 200 items"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
const len1 = data5.length;
for(let i1=0; i1<len1; i1++){
let data6 = data5[i1];
if(data6 && typeof data6 == "object" && !Array.isArray(data6)){
for(const key2 in data6){
let data7 = data6[key2];
if((((typeof data7 !== "string") && (!(typeof data7 == "number"))) && (typeof data7 !== "boolean")) && (data7 !== null)){
const err17 = {instancePath:instancePath+"/rows/" + i1+"/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),schemaPath:"#/properties/rows/items/additionalProperties/type",keyword:"type",params:{type: schema121.properties.rows.items.additionalProperties.type},message:"must be string,number,boolean,null"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
else {
const err18 = {instancePath:instancePath+"/rows/" + i1,schemaPath:"#/properties/rows/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
}
else {
const err19 = {instancePath:instancePath+"/rows",schemaPath:"#/properties/rows/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.caption !== undefined){
let data8 = data.caption;
if(typeof data8 === "string"){
if(func1(data8) > 200){
const err20 = {instancePath:instancePath+"/caption",schemaPath:"#/properties/caption/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
else {
const err21 = {instancePath:instancePath+"/caption",schemaPath:"#/properties/caption/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
}
else {
const err22 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
validate113.errors = vErrors;
return errors === 0;
}
validate113.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Chart = validate114;
const schema122 = {"$id":"https://corellia.dev/catalog/props/Chart.json","type":"object","additionalProperties":false,"required":["kind","series"],"properties":{"kind":{"type":"string","enum":["bar","line","area"]},"series":{"type":"array","minItems":1,"maxItems":6,"items":{"type":"object","additionalProperties":false,"required":["name","points"],"properties":{"name":{"type":"string","maxLength":40},"points":{"type":"array","maxItems":500,"items":{"type":"object","additionalProperties":false,"required":["x","y"],"properties":{"x":{"type":["string","number"]},"y":{"type":"number"}}}}}}},"x_label":{"type":"string","maxLength":40},"y_label":{"type":"string","maxLength":40},"y_min":{"type":"number"},"y_max":{"type":"number"}}};

function validate114(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Chart.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate114.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.kind === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "kind"},message:"must have required property '"+"kind"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.series === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "series"},message:"must have required property '"+"series"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((((((key0 === "kind") || (key0 === "series")) || (key0 === "x_label")) || (key0 === "y_label")) || (key0 === "y_min")) || (key0 === "y_max"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.kind !== undefined){
let data0 = data.kind;
if(typeof data0 !== "string"){
const err3 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(!(((data0 === "bar") || (data0 === "line")) || (data0 === "area"))){
const err4 = {instancePath:instancePath+"/kind",schemaPath:"#/properties/kind/enum",keyword:"enum",params:{allowedValues: schema122.properties.kind.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
if(data.series !== undefined){
let data1 = data.series;
if(Array.isArray(data1)){
if(data1.length > 6){
const err5 = {instancePath:instancePath+"/series",schemaPath:"#/properties/series/maxItems",keyword:"maxItems",params:{limit: 6},message:"must NOT have more than 6 items"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
if(data1.length < 1){
const err6 = {instancePath:instancePath+"/series",schemaPath:"#/properties/series/minItems",keyword:"minItems",params:{limit: 1},message:"must NOT have fewer than 1 items"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
const len0 = data1.length;
for(let i0=0; i0<len0; i0++){
let data2 = data1[i0];
if(data2 && typeof data2 == "object" && !Array.isArray(data2)){
if(data2.name === undefined){
const err7 = {instancePath:instancePath+"/series/" + i0,schemaPath:"#/properties/series/items/required",keyword:"required",params:{missingProperty: "name"},message:"must have required property '"+"name"+"'"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
if(data2.points === undefined){
const err8 = {instancePath:instancePath+"/series/" + i0,schemaPath:"#/properties/series/items/required",keyword:"required",params:{missingProperty: "points"},message:"must have required property '"+"points"+"'"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
for(const key1 in data2){
if(!((key1 === "name") || (key1 === "points"))){
const err9 = {instancePath:instancePath+"/series/" + i0,schemaPath:"#/properties/series/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data2.name !== undefined){
let data3 = data2.name;
if(typeof data3 === "string"){
if(func1(data3) > 40){
const err10 = {instancePath:instancePath+"/series/" + i0+"/name",schemaPath:"#/properties/series/items/properties/name/maxLength",keyword:"maxLength",params:{limit: 40},message:"must NOT have more than 40 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/series/" + i0+"/name",schemaPath:"#/properties/series/items/properties/name/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data2.points !== undefined){
let data4 = data2.points;
if(Array.isArray(data4)){
if(data4.length > 500){
const err12 = {instancePath:instancePath+"/series/" + i0+"/points",schemaPath:"#/properties/series/items/properties/points/maxItems",keyword:"maxItems",params:{limit: 500},message:"must NOT have more than 500 items"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
const len1 = data4.length;
for(let i1=0; i1<len1; i1++){
let data5 = data4[i1];
if(data5 && typeof data5 == "object" && !Array.isArray(data5)){
if(data5.x === undefined){
const err13 = {instancePath:instancePath+"/series/" + i0+"/points/" + i1,schemaPath:"#/properties/series/items/properties/points/items/required",keyword:"required",params:{missingProperty: "x"},message:"must have required property '"+"x"+"'"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
if(data5.y === undefined){
const err14 = {instancePath:instancePath+"/series/" + i0+"/points/" + i1,schemaPath:"#/properties/series/items/properties/points/items/required",keyword:"required",params:{missingProperty: "y"},message:"must have required property '"+"y"+"'"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
for(const key2 in data5){
if(!((key2 === "x") || (key2 === "y"))){
const err15 = {instancePath:instancePath+"/series/" + i0+"/points/" + i1,schemaPath:"#/properties/series/items/properties/points/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key2},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data5.x !== undefined){
let data6 = data5.x;
if((typeof data6 !== "string") && (!(typeof data6 == "number"))){
const err16 = {instancePath:instancePath+"/series/" + i0+"/points/" + i1+"/x",schemaPath:"#/properties/series/items/properties/points/items/properties/x/type",keyword:"type",params:{type: schema122.properties.series.items.properties.points.items.properties.x.type},message:"must be string,number"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
if(data5.y !== undefined){
if(!(typeof data5.y == "number")){
const err17 = {instancePath:instancePath+"/series/" + i0+"/points/" + i1+"/y",schemaPath:"#/properties/series/items/properties/points/items/properties/y/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
else {
const err18 = {instancePath:instancePath+"/series/" + i0+"/points/" + i1,schemaPath:"#/properties/series/items/properties/points/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
}
else {
const err19 = {instancePath:instancePath+"/series/" + i0+"/points",schemaPath:"#/properties/series/items/properties/points/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
}
else {
const err20 = {instancePath:instancePath+"/series/" + i0,schemaPath:"#/properties/series/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
}
}
else {
const err21 = {instancePath:instancePath+"/series",schemaPath:"#/properties/series/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
}
if(data.x_label !== undefined){
let data8 = data.x_label;
if(typeof data8 === "string"){
if(func1(data8) > 40){
const err22 = {instancePath:instancePath+"/x_label",schemaPath:"#/properties/x_label/maxLength",keyword:"maxLength",params:{limit: 40},message:"must NOT have more than 40 characters"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
}
else {
const err23 = {instancePath:instancePath+"/x_label",schemaPath:"#/properties/x_label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
if(data.y_label !== undefined){
let data9 = data.y_label;
if(typeof data9 === "string"){
if(func1(data9) > 40){
const err24 = {instancePath:instancePath+"/y_label",schemaPath:"#/properties/y_label/maxLength",keyword:"maxLength",params:{limit: 40},message:"must NOT have more than 40 characters"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
else {
const err25 = {instancePath:instancePath+"/y_label",schemaPath:"#/properties/y_label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
if(data.y_min !== undefined){
if(!(typeof data.y_min == "number")){
const err26 = {instancePath:instancePath+"/y_min",schemaPath:"#/properties/y_min/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
}
if(data.y_max !== undefined){
if(!(typeof data.y_max == "number")){
const err27 = {instancePath:instancePath+"/y_max",schemaPath:"#/properties/y_max/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err27];
}
else {
vErrors.push(err27);
}
errors++;
}
}
}
else {
const err28 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err28];
}
else {
vErrors.push(err28);
}
errors++;
}
validate114.errors = vErrors;
return errors === 0;
}
validate114.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Timeline = validate115;
const schema123 = {"$id":"https://corellia.dev/catalog/props/Timeline.json","type":"object","additionalProperties":false,"required":["items"],"properties":{"items":{"type":"array","maxItems":50,"items":{"type":"object","additionalProperties":false,"required":["time","title"],"properties":{"time":{"type":"string","maxLength":40},"title":{"type":"string","maxLength":120},"detail":{"type":"string","maxLength":300},"state":{"type":"string","enum":["past","current","upcoming"],"default":"upcoming"}}}}}};

function validate115(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Timeline.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate115.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.items === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "items"},message:"must have required property '"+"items"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!(key0 === "items")){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.items !== undefined){
let data0 = data.items;
if(Array.isArray(data0)){
if(data0.length > 50){
const err2 = {instancePath:instancePath+"/items",schemaPath:"#/properties/items/maxItems",keyword:"maxItems",params:{limit: 50},message:"must NOT have more than 50 items"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
let data1 = data0[i0];
if(data1 && typeof data1 == "object" && !Array.isArray(data1)){
if(data1.time === undefined){
const err3 = {instancePath:instancePath+"/items/" + i0,schemaPath:"#/properties/items/items/required",keyword:"required",params:{missingProperty: "time"},message:"must have required property '"+"time"+"'"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(data1.title === undefined){
const err4 = {instancePath:instancePath+"/items/" + i0,schemaPath:"#/properties/items/items/required",keyword:"required",params:{missingProperty: "title"},message:"must have required property '"+"title"+"'"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
for(const key1 in data1){
if(!((((key1 === "time") || (key1 === "title")) || (key1 === "detail")) || (key1 === "state"))){
const err5 = {instancePath:instancePath+"/items/" + i0,schemaPath:"#/properties/items/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data1.time !== undefined){
let data2 = data1.time;
if(typeof data2 === "string"){
if(func1(data2) > 40){
const err6 = {instancePath:instancePath+"/items/" + i0+"/time",schemaPath:"#/properties/items/items/properties/time/maxLength",keyword:"maxLength",params:{limit: 40},message:"must NOT have more than 40 characters"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/items/" + i0+"/time",schemaPath:"#/properties/items/items/properties/time/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data1.title !== undefined){
let data3 = data1.title;
if(typeof data3 === "string"){
if(func1(data3) > 120){
const err8 = {instancePath:instancePath+"/items/" + i0+"/title",schemaPath:"#/properties/items/items/properties/title/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
else {
const err9 = {instancePath:instancePath+"/items/" + i0+"/title",schemaPath:"#/properties/items/items/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
if(data1.detail !== undefined){
let data4 = data1.detail;
if(typeof data4 === "string"){
if(func1(data4) > 300){
const err10 = {instancePath:instancePath+"/items/" + i0+"/detail",schemaPath:"#/properties/items/items/properties/detail/maxLength",keyword:"maxLength",params:{limit: 300},message:"must NOT have more than 300 characters"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
}
else {
const err11 = {instancePath:instancePath+"/items/" + i0+"/detail",schemaPath:"#/properties/items/items/properties/detail/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data1.state !== undefined){
let data5 = data1.state;
if(typeof data5 !== "string"){
const err12 = {instancePath:instancePath+"/items/" + i0+"/state",schemaPath:"#/properties/items/items/properties/state/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(!(((data5 === "past") || (data5 === "current")) || (data5 === "upcoming"))){
const err13 = {instancePath:instancePath+"/items/" + i0+"/state",schemaPath:"#/properties/items/items/properties/state/enum",keyword:"enum",params:{allowedValues: schema123.properties.items.items.properties.state.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
}
}
else {
const err14 = {instancePath:instancePath+"/items/" + i0,schemaPath:"#/properties/items/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
else {
const err15 = {instancePath:instancePath+"/items",schemaPath:"#/properties/items/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
}
else {
const err16 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
validate115.errors = vErrors;
return errors === 0;
}
validate115.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Image = validate116;
const schema124 = {"$id":"https://corellia.dev/catalog/props/Image.json","type":"object","additionalProperties":false,"required":["src","alt"],"properties":{"src":{"type":"string","pattern":"^https://\\S+$","maxLength":2000},"alt":{"type":"string","maxLength":300},"fit":{"type":"string","enum":["contain","cover"],"default":"contain"}}};
const pattern37 = new RegExp("^https://\\S+$", "u");

function validate116(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Image.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate116.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.src === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "src"},message:"must have required property '"+"src"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.alt === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "alt"},message:"must have required property '"+"alt"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!(((key0 === "src") || (key0 === "alt")) || (key0 === "fit"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.src !== undefined){
let data0 = data.src;
if(typeof data0 === "string"){
if(func1(data0) > 2000){
const err3 = {instancePath:instancePath+"/src",schemaPath:"#/properties/src/maxLength",keyword:"maxLength",params:{limit: 2000},message:"must NOT have more than 2000 characters"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
if(!pattern37.test(data0)){
const err4 = {instancePath:instancePath+"/src",schemaPath:"#/properties/src/pattern",keyword:"pattern",params:{pattern: "^https://\\S+$"},message:"must match pattern \""+"^https://\\S+$"+"\""};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/src",schemaPath:"#/properties/src/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.alt !== undefined){
let data1 = data.alt;
if(typeof data1 === "string"){
if(func1(data1) > 300){
const err6 = {instancePath:instancePath+"/alt",schemaPath:"#/properties/alt/maxLength",keyword:"maxLength",params:{limit: 300},message:"must NOT have more than 300 characters"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/alt",schemaPath:"#/properties/alt/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.fit !== undefined){
let data2 = data.fit;
if(typeof data2 !== "string"){
const err8 = {instancePath:instancePath+"/fit",schemaPath:"#/properties/fit/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(!((data2 === "contain") || (data2 === "cover"))){
const err9 = {instancePath:instancePath+"/fit",schemaPath:"#/properties/fit/enum",keyword:"enum",params:{allowedValues: schema124.properties.fit.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
else {
const err10 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
validate116.errors = vErrors;
return errors === 0;
}
validate116.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Map = validate117;
const schema125 = {"$id":"https://corellia.dev/catalog/props/Map.json","type":"object","additionalProperties":false,"required":["center"],"properties":{"center":{"type":"array","items":{"type":"number"},"minItems":2,"maxItems":2},"zoom":{"type":"number","minimum":1,"maximum":19,"default":12},"markers":{"type":"array","maxItems":50,"items":{"type":"object","additionalProperties":false,"required":["position"],"properties":{"position":{"type":"array","items":{"type":"number"},"minItems":2,"maxItems":2},"label":{"type":"string","maxLength":60}}}},"route":{"type":"array","maxItems":2000,"items":{"type":"array","items":{"type":"number"},"minItems":2,"maxItems":2}}}};

function validate117(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Map.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate117.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.center === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "center"},message:"must have required property '"+"center"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "center") || (key0 === "zoom")) || (key0 === "markers")) || (key0 === "route"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.center !== undefined){
let data0 = data.center;
if(Array.isArray(data0)){
if(data0.length > 2){
const err2 = {instancePath:instancePath+"/center",schemaPath:"#/properties/center/maxItems",keyword:"maxItems",params:{limit: 2},message:"must NOT have more than 2 items"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(data0.length < 2){
const err3 = {instancePath:instancePath+"/center",schemaPath:"#/properties/center/minItems",keyword:"minItems",params:{limit: 2},message:"must NOT have fewer than 2 items"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
const len0 = data0.length;
for(let i0=0; i0<len0; i0++){
if(!(typeof data0[i0] == "number")){
const err4 = {instancePath:instancePath+"/center/" + i0,schemaPath:"#/properties/center/items/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
}
else {
const err5 = {instancePath:instancePath+"/center",schemaPath:"#/properties/center/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.zoom !== undefined){
let data2 = data.zoom;
if(typeof data2 == "number"){
if(data2 > 19 || isNaN(data2)){
const err6 = {instancePath:instancePath+"/zoom",schemaPath:"#/properties/zoom/maximum",keyword:"maximum",params:{comparison: "<=", limit: 19},message:"must be <= 19"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
if(data2 < 1 || isNaN(data2)){
const err7 = {instancePath:instancePath+"/zoom",schemaPath:"#/properties/zoom/minimum",keyword:"minimum",params:{comparison: ">=", limit: 1},message:"must be >= 1"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
else {
const err8 = {instancePath:instancePath+"/zoom",schemaPath:"#/properties/zoom/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
}
if(data.markers !== undefined){
let data3 = data.markers;
if(Array.isArray(data3)){
if(data3.length > 50){
const err9 = {instancePath:instancePath+"/markers",schemaPath:"#/properties/markers/maxItems",keyword:"maxItems",params:{limit: 50},message:"must NOT have more than 50 items"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
const len1 = data3.length;
for(let i1=0; i1<len1; i1++){
let data4 = data3[i1];
if(data4 && typeof data4 == "object" && !Array.isArray(data4)){
if(data4.position === undefined){
const err10 = {instancePath:instancePath+"/markers/" + i1,schemaPath:"#/properties/markers/items/required",keyword:"required",params:{missingProperty: "position"},message:"must have required property '"+"position"+"'"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
for(const key1 in data4){
if(!((key1 === "position") || (key1 === "label"))){
const err11 = {instancePath:instancePath+"/markers/" + i1,schemaPath:"#/properties/markers/items/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key1},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err11];
}
else {
vErrors.push(err11);
}
errors++;
}
}
if(data4.position !== undefined){
let data5 = data4.position;
if(Array.isArray(data5)){
if(data5.length > 2){
const err12 = {instancePath:instancePath+"/markers/" + i1+"/position",schemaPath:"#/properties/markers/items/properties/position/maxItems",keyword:"maxItems",params:{limit: 2},message:"must NOT have more than 2 items"};
if(vErrors === null){
vErrors = [err12];
}
else {
vErrors.push(err12);
}
errors++;
}
if(data5.length < 2){
const err13 = {instancePath:instancePath+"/markers/" + i1+"/position",schemaPath:"#/properties/markers/items/properties/position/minItems",keyword:"minItems",params:{limit: 2},message:"must NOT have fewer than 2 items"};
if(vErrors === null){
vErrors = [err13];
}
else {
vErrors.push(err13);
}
errors++;
}
const len2 = data5.length;
for(let i2=0; i2<len2; i2++){
if(!(typeof data5[i2] == "number")){
const err14 = {instancePath:instancePath+"/markers/" + i1+"/position/" + i2,schemaPath:"#/properties/markers/items/properties/position/items/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err14];
}
else {
vErrors.push(err14);
}
errors++;
}
}
}
else {
const err15 = {instancePath:instancePath+"/markers/" + i1+"/position",schemaPath:"#/properties/markers/items/properties/position/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err15];
}
else {
vErrors.push(err15);
}
errors++;
}
}
if(data4.label !== undefined){
let data7 = data4.label;
if(typeof data7 === "string"){
if(func1(data7) > 60){
const err16 = {instancePath:instancePath+"/markers/" + i1+"/label",schemaPath:"#/properties/markers/items/properties/label/maxLength",keyword:"maxLength",params:{limit: 60},message:"must NOT have more than 60 characters"};
if(vErrors === null){
vErrors = [err16];
}
else {
vErrors.push(err16);
}
errors++;
}
}
else {
const err17 = {instancePath:instancePath+"/markers/" + i1+"/label",schemaPath:"#/properties/markers/items/properties/label/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err17];
}
else {
vErrors.push(err17);
}
errors++;
}
}
}
else {
const err18 = {instancePath:instancePath+"/markers/" + i1,schemaPath:"#/properties/markers/items/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err18];
}
else {
vErrors.push(err18);
}
errors++;
}
}
}
else {
const err19 = {instancePath:instancePath+"/markers",schemaPath:"#/properties/markers/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err19];
}
else {
vErrors.push(err19);
}
errors++;
}
}
if(data.route !== undefined){
let data8 = data.route;
if(Array.isArray(data8)){
if(data8.length > 2000){
const err20 = {instancePath:instancePath+"/route",schemaPath:"#/properties/route/maxItems",keyword:"maxItems",params:{limit: 2000},message:"must NOT have more than 2000 items"};
if(vErrors === null){
vErrors = [err20];
}
else {
vErrors.push(err20);
}
errors++;
}
const len3 = data8.length;
for(let i3=0; i3<len3; i3++){
let data9 = data8[i3];
if(Array.isArray(data9)){
if(data9.length > 2){
const err21 = {instancePath:instancePath+"/route/" + i3,schemaPath:"#/properties/route/items/maxItems",keyword:"maxItems",params:{limit: 2},message:"must NOT have more than 2 items"};
if(vErrors === null){
vErrors = [err21];
}
else {
vErrors.push(err21);
}
errors++;
}
if(data9.length < 2){
const err22 = {instancePath:instancePath+"/route/" + i3,schemaPath:"#/properties/route/items/minItems",keyword:"minItems",params:{limit: 2},message:"must NOT have fewer than 2 items"};
if(vErrors === null){
vErrors = [err22];
}
else {
vErrors.push(err22);
}
errors++;
}
const len4 = data9.length;
for(let i4=0; i4<len4; i4++){
if(!(typeof data9[i4] == "number")){
const err23 = {instancePath:instancePath+"/route/" + i3+"/" + i4,schemaPath:"#/properties/route/items/items/type",keyword:"type",params:{type: "number"},message:"must be number"};
if(vErrors === null){
vErrors = [err23];
}
else {
vErrors.push(err23);
}
errors++;
}
}
}
else {
const err24 = {instancePath:instancePath+"/route/" + i3,schemaPath:"#/properties/route/items/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err24];
}
else {
vErrors.push(err24);
}
errors++;
}
}
}
else {
const err25 = {instancePath:instancePath+"/route",schemaPath:"#/properties/route/type",keyword:"type",params:{type: "array"},message:"must be array"};
if(vErrors === null){
vErrors = [err25];
}
else {
vErrors.push(err25);
}
errors++;
}
}
}
else {
const err26 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err26];
}
else {
vErrors.push(err26);
}
errors++;
}
validate117.errors = vErrors;
return errors === 0;
}
validate117.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Confirm = validate118;
const schema126 = {"$id":"https://corellia.dev/catalog/props/Confirm.json","type":"object","additionalProperties":false,"required":["proposal_id","title"],"properties":{"proposal_id":{"type":"string"},"title":{"type":"string","maxLength":120},"detail":{"type":"string","maxLength":400},"risk":{"type":"string","enum":["low","medium","high"],"default":"low"}}};

function validate118(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Confirm.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate118.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.proposal_id === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "proposal_id"},message:"must have required property '"+"proposal_id"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
if(data.title === undefined){
const err1 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "title"},message:"must have required property '"+"title"+"'"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
for(const key0 in data){
if(!((((key0 === "proposal_id") || (key0 === "title")) || (key0 === "detail")) || (key0 === "risk"))){
const err2 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
}
if(data.proposal_id !== undefined){
if(typeof data.proposal_id !== "string"){
const err3 = {instancePath:instancePath+"/proposal_id",schemaPath:"#/properties/proposal_id/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.title !== undefined){
let data1 = data.title;
if(typeof data1 === "string"){
if(func1(data1) > 120){
const err4 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/maxLength",keyword:"maxLength",params:{limit: 120},message:"must NOT have more than 120 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/title",schemaPath:"#/properties/title/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
if(data.detail !== undefined){
let data2 = data.detail;
if(typeof data2 === "string"){
if(func1(data2) > 400){
const err6 = {instancePath:instancePath+"/detail",schemaPath:"#/properties/detail/maxLength",keyword:"maxLength",params:{limit: 400},message:"must NOT have more than 400 characters"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
}
else {
const err7 = {instancePath:instancePath+"/detail",schemaPath:"#/properties/detail/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err7];
}
else {
vErrors.push(err7);
}
errors++;
}
}
if(data.risk !== undefined){
let data3 = data.risk;
if(typeof data3 !== "string"){
const err8 = {instancePath:instancePath+"/risk",schemaPath:"#/properties/risk/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err8];
}
else {
vErrors.push(err8);
}
errors++;
}
if(!(((data3 === "low") || (data3 === "medium")) || (data3 === "high"))){
const err9 = {instancePath:instancePath+"/risk",schemaPath:"#/properties/risk/enum",keyword:"enum",params:{allowedValues: schema126.properties.risk.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err9];
}
else {
vErrors.push(err9);
}
errors++;
}
}
}
else {
const err10 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err10];
}
else {
vErrors.push(err10);
}
errors++;
}
validate118.errors = vErrors;
return errors === 0;
}
validate118.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

export const validateProps_Status = validate119;
const schema127 = {"$id":"https://corellia.dev/catalog/props/Status.json","type":"object","additionalProperties":false,"required":["text"],"properties":{"level":{"type":"string","enum":["info","ok","warn","error"],"default":"info"},"text":{"type":"string","maxLength":200}}};

function validate119(data, {instancePath="", parentData, parentDataProperty, rootData=data, dynamicAnchors={}}={}){
/*# sourceURL="https://corellia.dev/catalog/props/Status.json" */;
let vErrors = null;
let errors = 0;
const evaluated0 = validate119.evaluated;
if(evaluated0.dynamicProps){
evaluated0.props = undefined;
}
if(evaluated0.dynamicItems){
evaluated0.items = undefined;
}
if(data && typeof data == "object" && !Array.isArray(data)){
if(data.text === undefined){
const err0 = {instancePath,schemaPath:"#/required",keyword:"required",params:{missingProperty: "text"},message:"must have required property '"+"text"+"'"};
if(vErrors === null){
vErrors = [err0];
}
else {
vErrors.push(err0);
}
errors++;
}
for(const key0 in data){
if(!((key0 === "level") || (key0 === "text"))){
const err1 = {instancePath,schemaPath:"#/additionalProperties",keyword:"additionalProperties",params:{additionalProperty: key0},message:"must NOT have additional properties"};
if(vErrors === null){
vErrors = [err1];
}
else {
vErrors.push(err1);
}
errors++;
}
}
if(data.level !== undefined){
let data0 = data.level;
if(typeof data0 !== "string"){
const err2 = {instancePath:instancePath+"/level",schemaPath:"#/properties/level/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err2];
}
else {
vErrors.push(err2);
}
errors++;
}
if(!((((data0 === "info") || (data0 === "ok")) || (data0 === "warn")) || (data0 === "error"))){
const err3 = {instancePath:instancePath+"/level",schemaPath:"#/properties/level/enum",keyword:"enum",params:{allowedValues: schema127.properties.level.enum},message:"must be equal to one of the allowed values"};
if(vErrors === null){
vErrors = [err3];
}
else {
vErrors.push(err3);
}
errors++;
}
}
if(data.text !== undefined){
let data1 = data.text;
if(typeof data1 === "string"){
if(func1(data1) > 200){
const err4 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/maxLength",keyword:"maxLength",params:{limit: 200},message:"must NOT have more than 200 characters"};
if(vErrors === null){
vErrors = [err4];
}
else {
vErrors.push(err4);
}
errors++;
}
}
else {
const err5 = {instancePath:instancePath+"/text",schemaPath:"#/properties/text/type",keyword:"type",params:{type: "string"},message:"must be string"};
if(vErrors === null){
vErrors = [err5];
}
else {
vErrors.push(err5);
}
errors++;
}
}
}
else {
const err6 = {instancePath,schemaPath:"#/type",keyword:"type",params:{type: "object"},message:"must be object"};
if(vErrors === null){
vErrors = [err6];
}
else {
vErrors.push(err6);
}
errors++;
}
validate119.errors = vErrors;
return errors === 0;
}
validate119.evaluated = {"props":true,"dynamicProps":false,"dynamicItems":false};

