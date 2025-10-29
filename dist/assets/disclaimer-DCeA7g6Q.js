import{R as z}from"./RichTextEditor-C2cgNlsO.js";import{x as S,y as T,S as V,H as j,Y as B,Z as D,$ as E,a0 as g}from"./antd-C-FgyWyA.js";import{d as L,f as l,_ as r,a1 as i,k as t,a7 as e,$ as d,a9 as N,a6 as H,G as u,u as x,F}from"./vue-PnzzEkKE.js";import{_ as M}from"./index-D3w9uP0F.js";import"./index-qgaYDQbP.js";const O={class:"disclaimer-container"},R={key:0,class:"content"},$=["innerHTML"],G={class:"update-time"},I={class:"text-gray-500"},P={key:1,class:"edit-mode"},U=`
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
`,Y=L({__name:"disclaimer",setup(Z){const n=l(!1),p=l(!1),c=l(U),a=l(""),f=l(new Date().toLocaleDateString("zh-CN")),y=()=>{n.value=!0,a.value=c.value},h=()=>{n.value=!1,a.value=""},v=async()=>{try{p.value=!0,await new Promise(s=>setTimeout(s,500)),c.value=a.value,f.value=new Date().toLocaleDateString("zh-CN"),g.success("免责声明保存成功"),n.value=!1,a.value=""}catch(s){console.error("保存失败:",s),g.error("保存失败，请稍后重试")}finally{p.value=!1}};return(s,o)=>{const m=j,b=V,_=S,w=T,C=E;return i(),r("div",O,[t(C,{title:"免责声明",bordered:!1},{extra:e(()=>[t(b,null,{default:e(()=>[n.value?(i(),r(F,{key:1},[t(m,{onClick:h},{default:e(()=>o[2]||(o[2]=[u("取消")])),_:1,__:[2]}),t(m,{type:"primary",loading:p.value,onClick:v},{icon:e(()=>[t(x(D))]),default:e(()=>[o[3]||(o[3]=u(" 保存 "))]),_:1,__:[3]},8,["loading"])],64)):(i(),H(m,{key:0,type:"primary",onClick:y},{icon:e(()=>[t(x(B))]),default:e(()=>[o[1]||(o[1]=u(" 编辑 "))]),_:1,__:[1]}))]),_:1})]),default:e(()=>[n.value?(i(),r("div",P,[t(z,{modelValue:a.value,"onUpdate:modelValue":o[0]||(o[0]=k=>a.value=k),height:600,"show-ai-embellish":!1,placeholder:"请输入免责声明内容"},null,8,["modelValue"]),t(_),t(w,{message:"提示",description:"保存后的内容将立即生效，请仔细核对后再保存。",type:"info","show-icon":"",class:"save-tip"})])):(i(),r("div",R,[d("div",{innerHTML:c.value},null,8,$),d("div",G,[t(_),d("p",I,"最后更新时间："+N(f.value),1)])]))]),_:1})])}}}),W=M(Y,[["__scopeId","data-v-089c7524"]]);export{W as default};
