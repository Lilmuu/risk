<template>
    <PageHeader :title="title" style="padding: 0 30px">
        <el-form :model="form" :rules="rules" ref="ruleForm" label-width="120px" class="demo-ruleForm" style="margin-top: 30px;">
            <el-form-item label="函数名：" prop="functionName">
                <el-input v-if="!detailStatus" v-model.trim="form.functionName" :maxlength="64"  show-word-limit placeholder="请输入函数名"></el-input>
                <span v-else>{{form.functionName}}</span>
            </el-form-item>
            <el-form-item label="函数说明：" >
                <el-input v-if="!detailStatus" v-model.trim="form.functionInfo" :maxlength="256"  show-word-limit placeholder="请输入函数说明"></el-input>
                <span v-else>{{form.functionInfo}}</span>
            </el-form-item>
            <el-form-item label="数据源：" prop="shortName">
                <el-select filterable v-if="!detailStatus" @change="shortNameChange" v-model="form.shortName" placeholder="请选择数据源">
                    <el-option
                    v-for="item in shortNameList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                </el-select>
                <span v-else>{{getShortName(form.shortName)}}</span>
            </el-form-item>
            <el-form-item label="接口名称：" prop="apiName">
                <el-select filterable v-if="!detailStatus" v-model="form.apiName" placeholder="请选择接口名称">
                    <el-option
                    v-for="item in apiNameList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                </el-select>
                <span v-else>{{form.apiName}}</span>
            </el-form-item>
            <el-form-item label="上传类型：" prop="fileUploadType">
                <el-radio-group v-if="!detailStatus" v-model="form.fileUploadType">
                    <el-radio :label="1">代码文件</el-radio>
                    <el-radio :label="2">代码片段</el-radio>
                </el-radio-group>
                <span v-else>{{form.fileUploadType == 1 ? '代码文件' : '代码片段'}}</span>
            </el-form-item>
            <el-form-item v-if="form.fileUploadType == 1" label="代码文件：" prop="filePath">
                <el-upload
                    class="upload-demo"
                    ref="elUpload"
                    v-if="!detailStatus"
                    :action="actionUrl"
                    accept=".py"
                    :on-success="handleSuccess"
                    :on-remove="handleRemove"
                    :on-preview="handlePreview"
                    :file-list="fileList">
                    <el-button size="small" type="primary">选取文件</el-button>
                </el-upload>
                <div v-if="detailStatus">
                    <!-- <span class="previewBtn" @click="handlePreview({url:form.fileLink})">{{getFileName(form.filePath)}}</span> -->
                    <span>{{getFileName(form.filePath)}}</span>
                </div>
                <zebra-button v-if="detailStatus" type="primary " size="mini" @click="DownloadFile">下载</zebra-button>
            </el-form-item>
            <el-form-item  v-if="form.fileUploadType == 2" label="代码片段：" prop="scriptCode">
                <el-input
                v-if="!detailStatus"
                type="textarea"
                :rows="12"
                placeholder="请输入代码片段"
                v-model="form.scriptCode">
                </el-input>
                <span v-else v-html="replaceString(form.scriptCode)"></span>
            </el-form-item>
        </el-form>
    </PageHeader>
</template>

<script>
import { getSearchList } from './api'
import PageHeader from "@/components/page-header/PageHeader";
import { previewUrl } from './tableColumn'

export default{
    props:{
        shortNameList:{
            type:Array,
            default:[]
        },
        title:{
            type:String,
            default:''
        }
    },
    components: {PageHeader},
    data() {
        const validFile = (rule,value,callback) => {
            if(!this.form.filePath){
                return callback(new Error('请上传文件'))
            }
            callback()
        }
        return {
            actionUrl:process.env.NODE_ENV == "development" ? 'http://zebra.dev.com/api/file/upload/risk-python' : '/api/file/upload/risk-python',
            apiNameList:[],
            fileList:[],
            form:{
                functionName:'',
                functionInfo:'',
                shortName:'',
                apiName:'',
                fileUploadType:'',
                filePath:'',
                scriptCode:'',
                fileLink:''
            },
            rules: {
                functionName: [{ required: true, message: '请输入函数名', trigger: 'blur' }],
                shortName: [{ required: true, message: '请选择数据源', trigger: 'blur' }],
                apiName: [{ required: true, message: '请选择接口名称', trigger: 'blur' }],
                fileUploadType: [{ required: true, message: '请选择上传类型', trigger: 'blur' }],
                filePath: [{ validator: validFile, trigger: 'blur' }],
                scriptCode: [{ required: true, message: '请输入代码片段', trigger: 'blur' }],
            },
            detailStatus:false,
            rowId:''
        }
    },
    computed:{
        getShortName(){
            return (shortName) => {
                const obj = this.shortNameList.find(el => el.value == shortName)
                return obj.label
            }
        },
        replaceString(){
            return (code) => {
                const str = JSON.stringify(code).replace(/\\n/g,'<br>')
                return JSON.parse(str)
            }
        }
    },
    methods: {
        async shortNameChange(val){
            let param = {
                size:500,
                current:1,
                fullName:val
            }
            const res = await getSearchList(param)
            this.apiNameList = res.data.data.records.map(el => {
                return {
                    label:el.apiName,
                    value:el.apiName
                }
            })
        },
        handleSuccess(res){
            this.fileList = [{name:res.data.originalFileName,url:res.data.filelink}]
            this.form.filePath = res.data.fileName
        },
        handleRemove(){
            this.form.filePath = ''
        },
        validForm(){
            return new Promise(resolve => {
                this.$refs.ruleForm.validate(valid => {
                    if(valid){
                        if(this.form.fileUploadType == 1){
                            this.form.scriptCode = ''
                            this.form.fileLink = this.fileList[0].url
                        }else{
                            this.form.filePath = ''
                            this.form.fileLink = ''
                        }
                        resolve(this.rowId? Object.assign({},this.form,{id:this.rowId}) : this.form)
                    }
                })
            })
            
        },
        resetForm(){
            this.$refs.ruleForm.resetFields()
            this.fileList = []
            this.$refs.elUpload && this.$refs.elUpload.clearFiles()
        },
        getFileName(name){
            const str1 = name.slice(name.lastIndexOf('/')+1)
            const str2 = str1.slice(0,str1.lastIndexOf('_')) + str1.slice(str1.lastIndexOf('.'))
            return str2
        },
        setDataOfForm(row,status){
            const obj = JSON.parse(JSON.stringify(row))
            status == 'edit' ? (this.rowId = row.id) : (this.rowId = '')
            for(const key in this.form){
                this.form[key] = obj[key]
            }
            status == 'edit' ? this.fileList = [{name:this.getFileName(this.form.filePath),url:this.form.fileLink}] : this.detailStatus = true
        },
        handlePreview(file){
            return
            window.open(`${previewUrl}onlinePreview?url=${encodeURIComponent(btoa(file.url))}`);
        },
        DownloadFile(){
            const url = this.form.fileLink.indexOf('py?') !== -1 ? this.form.fileLink.split('py?')[0] + 'py' : this.form.fileLink
            const link = document.createElement('a');
            link.href = url;
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    },
}
</script>

<style lang="scss" scoped>
.previewBtn{
    cursor: pointer;
    &:hover{
        color: #409eff;
    }
}
::v-deep .el-upload-list__item{
    line-height: 2.8;
    .el-icon-close, .el-icon-close-tip{
        line-height: 2.2;
    }
}
</style>