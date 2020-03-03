岗位 
/job

岗位发布
/api/job/publish

入参：
  job_type: 'product' | 'business',
  job_city: 'beijing',
  job_name: '产品经理实习生',
  job_email: 'test@163.com',
  job_origin: 'hr' | 'sp' | 'temp',
  job_desc: '工作概述，这里需要加上文本格式',
  job_isOffical: true, // 是否可转正

响应：
  {
    code: 200,
    msg: '发布成功',
    data: {
      gotoUrl: '', // 前去查看该信息
      job_id: '', //
    }
  }

