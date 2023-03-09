<template>
    <el-form :model="form" :rules="rules" ref="ruleForm" label-width="160px" class="demo-ruleForm" label-position="left">
        <el-form-item label="参数（字段名）：" prop="fieldEnglish">
            <el-input v-model.trim="form.fieldEnglish" :maxlength="32" @input="validFieldEnglish" show-word-limit placeholder="请输入参数（字段名）"></el-input>
        </el-form-item>
        <el-form-item label="中文名称：" prop="fieldChina">
            <el-input v-model.trim="form.fieldChina" @input="validFieldChina" :maxlength="32" show-word-limit placeholder="请输入中文名称"></el-input>
        </el-form-item>
        <el-form-item label="字段类型：" prop="fieldType">
            <el-select v-model="form.fieldType" placeholder="请选择字段类型">
                <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
                </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="是否必传：" class="customRequire">
            <span>是</span>
        </el-form-item>
        <el-form-item label="最大长度：" prop="fieldLength">
            <el-input-number v-model="form.fieldLength" controls-position="right" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="字段描述：">
            <el-input v-model="form.fieldDescribe" :maxlength="300" type="textarea" :rows="2" show-word-limit placeholder="请输入字段描述"></el-input>
        </el-form-item>
        <el-form-item label="字段来源：" >
            <span>自定义字段</span>
        </el-form-item>
    </el-form>
</template>

<script>
import { dictListData } from './api'
export default{
    data() {
        const checkName = (rule, value, callback) => {
            if(value){
                if(this.tableData.length){
                    for(const key in this.tableData){
                        if(value == this.tableData[key].fieldEnglish) return callback(new Error('！字段名字重复'))
                    }
                    callback()
                }else{
                    callback()
                }
            }
        };
        return {
            tableData:[],
            form:{
                fieldEnglish:'',
                fieldChina:'',
                fieldType:'',
                fieldLength:undefined,
                fieldDescribe:'',
                fieldRequired:true,
                fieldSource:'2'
            },
            rules: {
                fieldEnglish: [
                    { required: true, message: '请输入参数（字段名）', trigger: 'blur' },
                    { validator: checkName, trigger: 'change' }
                ],
                fieldChina: [{ required: true, message: '请输入中文名称', trigger: 'blur' }],
                fieldType: [{ required: true, message: '请输入字段类型', trigger: 'change' }],
                fieldLength: [{ required: true, message: '请输入最大长度', trigger: 'blur' }],
            },
            typeOptions:[],
        }
    },
    mounted(){
        this.getDicData()
    },
    methods: {
        async getDicData(){
            const res = await dictListData()
            this.typeOptions = res.data.data
        },
        initForm(row,data,index){
            if(row.paramsName){
                this.form = JSON.parse(JSON.stringify(row))
            }
            setTimeout(() => {
                this.tableData = JSON.parse(JSON.stringify(data)).filter((v,k) => v.fieldSource == '2' && k != index)
            }, 500);
        },
        valid(){
            this.$refs.ruleForm.validate(valid => {
                if(valid){
                    this.$emit('closeForm',this.form);
                }
            })
        },
        validFieldEnglish(val){
            this.form.fieldEnglish = val.replace(/[^\a-\z\A-\Z0-9]/g, '')
        },
        validFieldChina(val){
            this.form.fieldChina = val.replace(/[^\u4E00-\u9FA5\Z0-9]/g, '')
        }
    },
}
</script>

<style lang="scss">
.customRequire{
    .el-form-item__label::before{
        content: '*';
        color: #F56C6C;
        margin-right: 4px;
    }
}
</style>