import{R as N}from"./RichTextEditor-5OfriPyy.js";import{g as V,u as j}from"./config-CdFCjy5u.js";import{Y as D,x as E,y as L,S as T,H,Z as M,$ as A,a0 as F,a1 as u}from"./antd-Cme2pY03.js";import{d as O,f as i,o as R,_ as p,a1 as r,k as t,a7 as e,$,a6 as G,G as d,u as g,F as I}from"./vue-PnzzEkKE.js";import{_ as U}from"./index-LD9Em1il.js";import"./index-D4xTHXQv.js";const Y={class:"disclaimer-container"},Z={key:0,class:"content"},q=["innerHTML"],J={key:1,class:"edit-mode"},_=`
<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">使用条款</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  欢迎使用本系统。在使用本系统之前，请您仔细阅读以下条款。使用本系统即表示您同意接受以下所有条款的约束。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">服务说明</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统提供的所有信息和服务仅供参考，我们会尽力确保信息的准确性和完整性，但不对信息的准确性、完整性、可靠性做任何形式的保证。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">免责条款</h3>
<ul style="padding-left: 24px; margin-bottom: 16px;">
  <li style="margin-bottom: 8px; color: #595959;">用户使用本系统所存在的风险将完全由其本人承担，我们不承担任何责任。</li>
  <li style="margin-bottom: 8px; color: #595959;">我们不保证服务一定能满足用户的要求，也不保证服务不会中断。</li>
  <li style="margin-bottom: 8px; color: #595959;">我们不对因不可抗力或我们不能控制的原因造成的网络服务中断或其它缺陷负责。</li>
  <li style="margin-bottom: 8px; color: #595959;">用户理解并同意自行承担使用本系统服务的风险，包括但不限于数据丢失、服务中断等。</li>
</ul>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">用户责任</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  用户应当遵守国家法律法规，不得利用本系统从事违法违规活动。用户对其使用本系统的一切行为负责。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">知识产权</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统的所有内容，包括但不限于文字、图片、标识、界面设计等，均受知识产权法保护，未经许可不得擅自使用。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">免责声明的修改</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  我们保留随时修改本免责声明的权利，修改后的内容将在本页面公布，请您定期查阅。
</p>
`,K=O({__name:"disclaimer",setup(P){const l=i(!1),c=i(!1),m=i(!1),s=i(_),n=i(""),y=i(new Date().toLocaleDateString("zh-CN")),x=async()=>{try{m.value=!0;const o=await V({code:"privacy"});o&&o.data&&o.data.config&&(s.value=o.data.config)}catch(o){console.error("获取隐私协议失败:",o),s.value=_}finally{m.value=!1}};R(()=>{x()});const v=()=>{l.value=!0,n.value=s.value},h=()=>{l.value=!1,n.value=""},b=async()=>{try{c.value=!0,await j({config:n.value,keyName:"privacy"}),s.value=n.value,y.value=new Date().toLocaleDateString("zh-CN"),u.success("隐私协议保存成功"),l.value=!1,n.value=""}catch(o){console.error("保存失败:",o),u.error("保存失败，请稍后重试")}finally{c.value=!1}};return(o,a)=>{const f=H,C=T,w=D,k=E,S=L,z=F;return r(),p("div",Y,[t(z,{title:"免责声明",bordered:!1},{extra:e(()=>[t(C,null,{default:e(()=>[l.value?(r(),p(I,{key:1},[t(f,{onClick:h},{default:e(()=>a[2]||(a[2]=[d("取消")])),_:1,__:[2]}),t(f,{type:"primary",loading:c.value,onClick:b},{icon:e(()=>[t(g(A))]),default:e(()=>[a[3]||(a[3]=d(" 保存 "))]),_:1,__:[3]},8,["loading"])],64)):(r(),G(f,{key:0,type:"primary",onClick:v},{icon:e(()=>[t(g(M))]),default:e(()=>[a[1]||(a[1]=d(" 编辑 "))]),_:1,__:[1]}))]),_:1})]),default:e(()=>[l.value?(r(),p("div",J,[t(N,{modelValue:n.value,"onUpdate:modelValue":a[0]||(a[0]=B=>n.value=B),height:600,"show-ai-embellish":!1,placeholder:"请输入免责声明内容"},null,8,["modelValue"]),t(k),t(S,{message:"提示",description:"保存后的内容将立即生效，请仔细核对后再保存。",type:"info","show-icon":"",class:"save-tip"})])):(r(),p("div",Z,[t(w,{spinning:m.value},{default:e(()=>[$("div",{innerHTML:s.value},null,8,q)]),_:1},8,["spinning"])]))]),_:1})])}}}),at=U(K,[["__scopeId","data-v-488fc93e"]]);export{at as default};
