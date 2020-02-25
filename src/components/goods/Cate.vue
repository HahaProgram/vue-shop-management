<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_delected === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
          <el-tag size="mini" v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" @close="addCateDialogClosed" :visible.sync="addCateDialogVisible" width="50%">
      <!-- 表单 -->
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <el-cascader clearable change-on-select expand-trigger="hover" v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChanged"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      queryInfo: {
        // 查询条件
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      catelist: [], // 商品分类的数据
      total: 0, // 总数据,分页用
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template", // 表示将当前定义为模板列
          template: "isok" //  表示当前这一列使用模板名称
        },
        {
          label: "排序",
          type: "template", // 表示将当前定义为模板列
          template: "order" //  表示当前这一列使用模板名称
        },
        {
          label: "操作",
          type: "template", // 表示将当前定义为模板列
          template: "opt" //  表示当前这一列使用模板名称
        }
      ],
      addCateDialogVisible: false,
      addCateForm: {
        // 添加分类表单数据对象
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {// 添加分类对话框规则对象
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      parentCateList: [],  // 父级分类的列表
      cascaderProps: {  // 指定级联选择器的配置对象
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      selectedKeys: [] // 选中的父级分类的Id数组
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      console.log(res);
      if (res.meta.status !== 200)
        return this.$message.error("获取商品分类信息失败！！！");

      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    // 监听 pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听 pagenum 改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取父级分类数据失败！！！");
      this.parentCateList = res.data;
    },
    // 选择项发生变化触发这个函数
    parentCateChanged(){
      // 如果 selectedKeys 数组中的 length 大于0，证明选中的父级分类
      // 反之，说明没有选中任何父级分类
      if(this.selectedKeys.length > 0){
        // 为父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      }else{
        // 父级分类的Id
        this.addCateForm.cat_pid = 0
        // 为当前分类的等级赋值
        this,addCateForm.cat_level = 0
      }
    },
    // 添加分类确认按钮
    addCate(){
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories', this.addCateForm)
        if(res.meta.status !== 201){
          return this.$message.error('添加分类失败！！！')
        }
        this.$message.success('添加分类成功！！！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
      
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed(){
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
  }
};
</script>
<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader{
  width: 100%;
}
</style>