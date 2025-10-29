import{R as D}from"./RichTextEditor-C2cgNlsO.js";import{x as T,y as V,S as j,H as B,Y as E,Z as L,$ as N,a0 as _}from"./antd-C-FgyWyA.js";import{d as F,f as s,c as H,_ as p,a1 as i,k as o,a7 as e,$ as n,G as c,a9 as x,a6 as Y,u as y,F as M}from"./vue-PnzzEkKE.js";import{_ as O}from"./index-D3w9uP0F.js";import"./index-qgaYDQbP.js";const R={class:"copyright-container"},$={key:0,class:"content"},G=["innerHTML"],I={class:"copyright-info"},P={class:"info-box"},U={class:"text-gray-500"},Z={key:1,class:"edit-mode"},q=`
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
`,A=F({__name:"copyright",setup(J){const l=s(!1),m=s(!1),u=s(q),a=s(""),h=H(()=>new Date().getFullYear()),f=s(new Date().toLocaleDateString("zh-CN")),v=()=>{l.value=!0,a.value=u.value},b=()=>{l.value=!1,a.value=""},w=async()=>{try{m.value=!0,await new Promise(r=>setTimeout(r,500)),u.value=a.value,f.value=new Date().toLocaleDateString("zh-CN"),_.success("版权声明保存成功"),l.value=!1,a.value=""}catch(r){console.error("保存失败:",r),_.error("保存失败，请稍后重试")}finally{m.value=!1}};return(r,t)=>{const d=B,C=j,g=T,k=V,z=N;return i(),p("div",R,[o(z,{title:"版权声明",bordered:!1},{extra:e(()=>[o(C,null,{default:e(()=>[l.value?(i(),p(M,{key:1},[o(d,{onClick:b},{default:e(()=>t[2]||(t[2]=[c("取消")])),_:1,__:[2]}),o(d,{type:"primary",loading:m.value,onClick:w},{icon:e(()=>[o(y(L))]),default:e(()=>[t[3]||(t[3]=c(" 保存 "))]),_:1,__:[3]},8,["loading"])],64)):(i(),Y(d,{key:0,type:"primary",onClick:v},{icon:e(()=>[o(y(E))]),default:e(()=>[t[1]||(t[1]=c(" 编辑 "))]),_:1,__:[1]}))]),_:1})]),default:e(()=>[l.value?(i(),p("div",Z,[o(D,{modelValue:a.value,"onUpdate:modelValue":t[0]||(t[0]=S=>a.value=S),height:600,"show-ai-embellish":!1,placeholder:"请输入版权声明内容"},null,8,["modelValue"]),o(g),o(k,{message:"提示",description:"保存后的内容将立即生效，请仔细核对后再保存。",type:"info","show-icon":"",class:"save-tip"})])):(i(),p("div",$,[n("div",{innerHTML:u.value},null,8,G),n("div",I,[o(g),n("div",P,[n("p",null,[t[4]||(t[4]=n("strong",null,"版权所有",-1)),c(" © "+x(h.value)+" 所有权利保留",1)]),n("p",U,"本声明最后更新日期："+x(f.value),1)])])]))]),_:1})])}}}),ot=O(A,[["__scopeId","data-v-b4b0efd6"]]);export{ot as default};
