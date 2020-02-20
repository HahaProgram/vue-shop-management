<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollpase ? '64px' : '200px'">
        <!-- 侧边栏菜单区域 -->
        <div class="toggle-button" @click="toggleCollpase">|||</div>
        <el-menu background-color="#333744" :router="true" :collapse="isCollpase" :collapse-transition="false"
        unique-opened text-color="#fff" active-text-color="#409EFF" :default-active="activePath"> 
          <!-- 一级菜单 -->
          <el-submenu :index="item.id + ''" v-for="item in MenuList" :key="item.id">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item @click="saveNavState('/'+subItem.path)" :index="'/'+subItem.path + ''" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体内容 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  created(){
    this.getMenuList(),
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data(){
    return {
      MenuList: [],
      iconObj: {
        '125': 'fa fa-user',
        '103': 'fa fa-cube',
        '101': 'fa fa-shopping-bag',
        '102': 'fa fa-file-text',
        '145': 'fa fa-line-chart'
      },
      isCollpase: false,
      activePath: ''
    }
  },
  methods: {
    loginOut() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenuList(){
      const {data: res} = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.MenuList = res.data
    },
    toggleCollpase(){
      return this.isCollpase = !this.isCollpase
    },
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
};
</script>
<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
  font-size: 20px;
}
.el-aside {
  background-color: #333744;
}
.el-main {
  background-color: #eaedf1;
}
.home-container {
  height: 100%;
}
.fa{
  margin-right: 10px;
}
.el-menu{
  border: 0px;
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  letter-spacing: 0.3em;
  color: #fff;
}
</style>
