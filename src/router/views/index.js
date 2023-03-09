export default [
	{
		path: '/package',
		name: '风控包管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/package/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/datasource',
		name: '账号管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/datasource/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/apimanage',
		name: '接口管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/apimanage/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/variable',
		name: '变量中心',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/variablecenter/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
  {
    path: '/policyProject',
    name: '规则流管理',
    component: () =>
      import ( /* webpackChunkName: "page" */ '@/views/policyproject/list'),
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/policyProjectAdd',
    name: '新增规则流',
    component: () =>
      import ( /* webpackChunkName: "page" */ '@/views/policyproject/ef/panel'),
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/policyProjectSee',
    name: '查看规则流',
    component: () =>
      import ( /* webpackChunkName: "page" */ '@/views/policyproject/ef/see'),
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
	{
		path: '/policyGroup',
		name: '规则集管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/policygroup/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
  {
    path: '/policyGroupAdd',
    name: '新增规则集',
    component: () =>
      import ( /* webpackChunkName: "page" */ '@/views/policygroup/add'),
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
  {
    path: '/policyGroupSee',
    name: '查看规则集',
    component: () =>
      import ( /* webpackChunkName: "page" */ '@/views/policygroup/see'),
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
	{
		path: '/policyManage',
		name: '规则管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/policy/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/policyAdd',
		name: '新增规则',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/policy/add'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/policySee',
		name: '查看规则',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/policy/see'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
  {
    path: '/policyLog',
    name: '调用日志',
    component: () =>
      import ( /* webpackChunkName: "page" */ '@/views/policyLog/list'),
    meta: {
      keepAlive: true,
      isTab: false,
      isAuth: false
    }
  },
	{
		path: '/variableBand',
		name: '变量绑定',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/policy/band'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/rulemanage',
		name: '规则集管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/rulemanage/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/testmanage',
		name: '规则集管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/testmanage/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/workorder',
		name: '工单管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/workorder/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/statistics',
		name: '统计管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/statistics/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/eventsManage',
		name: '事件管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/eventsManage/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/eventSubmit',
		name: '提交事件',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/eventsManage/submit'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
	{
		path: '/pythonManage',
		name: '事件管理',
		component: () =>
            import ( /* webpackChunkName: "page" */ '@/views/pythonManage/list'),
		meta: {
			keepAlive: true,
			isTab: false,
			isAuth: false
		}
	},
]
