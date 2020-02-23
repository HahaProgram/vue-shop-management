<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', 'vcenter', i1 === 0 ? 'bdtop' : '']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRoleById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="['vcenter', i2 === 0 ? '' : 'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRoleById(scope.row, item2.id)"
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      closable
                      @close="removeRoleById(scope.row, item3.id)"
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" class="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" class="el-icon-delete">删除</el-button>
            <el-button
              size="mini"
              type="warning"
              @click="showSetRightDialog(scope.row)"
              class="el-icon-setting"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog @close="setRightDialogClose" title="提示" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 树形控件 -->
      <el-tree node-key="id" ref="treeRef" :default-checked-keys="defKeys" :default-expand-all="true" :data="rightslist" :props="treeProps" show-checkbox></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rolesList: [],  // 角色列表数据
      setRightDialogVisible: false, // 分配权限对话框，
      rightslist: [] ,// 所有权限的数据
      treeProps: {   // 树形控件属性绑定的对象
          label: 'authName',
          children: 'children'
      },
      defKeys: [],  // 默认选中的节点Id值数组
      roleId: ''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取权限列表数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取信息失败！！！");
      }
      this.rolesList = res.data;
    },
    // 删除权限列表的标签
    async removeRoleById(role, rightId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("删除操作已取消！！！");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200)
        return this.$$message.error("删除权限失败！！！");
      role.children = res.data;
    },
    // 展示权限分配对话框
    async showSetRightDialog(role) {
        this.roleId = role.id
        const {data: res} = await this.$http.get('rights/tree')
        if(res.meta.status !== 200) return this.$message.error('获取权限数据失败！！！')
        // 获取的权限数据保存到data中
        this.rightslist = res.data
        // 递归获取三级节点的Id
        this.getleafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
    },
    // 递归获取三级权限节点Id
    getleafKeys(node, arr){
        // 如果当前 node 节点不包含 children 属性，则保存到 defKeys 数组中
        if(!node.children){
            return arr.push(node.id)
        }
        node.children.forEach(item=>
            this.getleafKeys(item, arr)
        )
    },
    // 监听分配权限对话框关闭事件
    setRightDialogClose(){
        this.defKeys = []
    },
    // 分配权限 添加权限
    async allotRights(){
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]

        const idStr = keys.join(',')
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids: idStr})
        if(res.meta.status !== 200) return this.$message.error('分配权限失败！！！')
        this.$message.success('分配权限成功！！！')
        this.setRightDialogVisible = false
        this.getRolesList()

    }
  }
};
</script>
<style lang="less" scope>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>