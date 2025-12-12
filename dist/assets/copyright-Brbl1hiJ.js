import{R as N}from"./RichTextEditor-9Ebw_-A3.js";import{g as V,u as j}from"./config-CBKPni_P.js";import{Y as E,x as L,y as T,S as D,H,Z as M,$ as A,a0 as F,a1 as d}from"./antd-D1-4Msx4.js";import{d as O,f as i,o as R,_ as p,a1 as r,k as t,a7 as e,$,a6 as G,G as u,u as g,F as I}from"./vue-PnzzEkKE.js";import{_ as U}from"./index-BQVwlz7A.js";import"./index-DCt2nNtB.js";const Y={class:"copyright-container"},Z={key:0,class:"content"},q=["innerHTML"],J={key:1,class:"edit-mode"},_=`
<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">版权所有</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统的所有内容，包括但不限于文字、图形、图片、照片、音频、视频、图表、色彩组合、版面设计、数据、软件等，
  均受《中华人民共和国著作权法》及相关法律法规和国际条约的保护。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">版权归属</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统及其所有组成部分的版权归本公司所有。未经本公司书面许可，任何单位和个人不得以任何方式或理由对本系统的任何部分进行使用、复制、修改、抄录、传播或与其它产品捆绑使用、销售。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">使用授权</h3>
<ul style="padding-left: 24px; margin-bottom: 16px;">
  <li style="margin-bottom: 8px; color: #595959;">授权用户可以在本系统范围内使用相关功能和服务。</li>
  <li style="margin-bottom: 8px; color: #595959;">未经授权，不得将系统内容用于商业目的。</li>
  <li style="margin-bottom: 8px; color: #595959;">不得擅自复制、传播或修改系统内的任何内容。</li>
  <li style="margin-bottom: 8px; color: #595959;">禁止对系统进行反向工程、反编译或反汇编。</li>
</ul>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">第三方内容</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本系统中可能包含第三方提供的内容，这些内容的版权归原作者所有。我们尊重并保护所有版权持有者的合法权益。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">侵权投诉</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  如果您认为本系统的内容侵犯了您的合法权益，请及时与我们联系，我们将在核实后采取相应的措施。
</p>

<h3 style="color: #1890ff; margin-top: 24px; margin-bottom: 12px; font-size: 16px; font-weight: 600;">法律适用</h3>
<p style="margin-bottom: 16px; text-align: justify; color: #595959;">
  本版权声明的解释、效力及纠纷的解决，适用于中华人民共和国法律。若有任何条款与国家法律法规相抵触时，则以国家法律法规为准。
</p>
`,K=O({__name:"copyright",setup(P){const l=i(!1),c=i(!1),m=i(!1),s=i(_),n=i(""),y=i(new Date().toLocaleDateString("zh-CN")),x=async()=>{try{m.value=!0;const o=await V({code:"copyright"});o&&o.data&&o.data.config&&(s.value=o.data.config)}catch(o){console.error("获取版权声明失败:",o),s.value=_}finally{m.value=!1}};R(()=>{x()});const h=()=>{l.value=!0,n.value=s.value},v=()=>{l.value=!1,n.value=""},b=async()=>{try{c.value=!0,await j({config:n.value,keyName:"copyright"}),s.value=n.value,y.value=new Date().toLocaleDateString("zh-CN"),d.success("版权声明保存成功"),l.value=!1,n.value=""}catch(o){console.error("保存失败:",o),d.error("保存失败，请稍后重试")}finally{c.value=!1}};return(o,a)=>{const f=H,C=D,w=E,k=L,S=T,z=F;return r(),p("div",Y,[t(z,{title:"版权声明",bordered:!1},{extra:e(()=>[t(C,null,{default:e(()=>[l.value?(r(),p(I,{key:1},[t(f,{onClick:v},{default:e(()=>a[2]||(a[2]=[u("取消")])),_:1,__:[2]}),t(f,{type:"primary",loading:c.value,onClick:b},{icon:e(()=>[t(g(A))]),default:e(()=>[a[3]||(a[3]=u(" 保存 "))]),_:1,__:[3]},8,["loading"])],64)):(r(),G(f,{key:0,type:"primary",onClick:h},{icon:e(()=>[t(g(M))]),default:e(()=>[a[1]||(a[1]=u(" 编辑 "))]),_:1,__:[1]}))]),_:1})]),default:e(()=>[l.value?(r(),p("div",J,[t(N,{modelValue:n.value,"onUpdate:modelValue":a[0]||(a[0]=B=>n.value=B),height:600,"show-ai-embellish":!1,placeholder:"请输入版权声明内容"},null,8,["modelValue"]),t(k),t(S,{message:"提示",description:"保存后的内容将立即生效，请仔细核对后再保存。",type:"info","show-icon":"",class:"save-tip"})])):(r(),p("div",Z,[t(w,{spinning:m.value},{default:e(()=>[$("div",{innerHTML:s.value},null,8,q)]),_:1},8,["spinning"])]))]),_:1})])}}}),at=U(K,[["__scopeId","data-v-de726f81"]]);export{at as default};
