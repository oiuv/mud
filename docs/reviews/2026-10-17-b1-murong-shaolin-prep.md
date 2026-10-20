# B1 慕容×少林共享 20 招预研

一次采集两派销账。kind 分布：direct 11/control 2/buff 4/combo 3。

## 关键约束

1. **MA-017**：da-mo.c ask_qingxin 写入 luan 键、ask_luan 写入 qingxin 键（互换），按源码原样记录
2. **少林内功硬约束**：jingang-quan/jingang 与 zui-gun/zuida 要求 mapped force ∈ {hunyuan-yiqi, yijinjing, luohan-fumogong}
3. **qingxin**：目标须 temp("powerup")，效果是清零 apply/attack+defense（非 do_damage）
4. **zuida**：与 powerup 互斥，增益依赖 drunk 条件
5. **chan 零费用**：只查 neili≥80 不扣减

## 绝招清单

| 招 | kind | type/percent | fee | 命中 |
| --- | --- | --- | --- | --- |
| damo-jian/luan | direct | WEAPON/70 | 200/100 | ap/2+rand>dp |
| damo-jian/shang | direct | WEAPON/30 | 200/100 | 同上 |
| damo-jian/zhe | direct | WEAPON/50 | 200/100 | 同上 |
| riyue-bian/shang | direct | WEAPON/100 | 300/100 | ap/2+rand>dp |
| fumo-jian/foxin | direct | WEAPON/30 | 150/60 | ap/2+rand>dp |
| qianye-shou/qianye | direct | UNARMED/35 | 100/30 | ap/2+rand>dp |
| pudu-zhang/zhao | direct | WEAPON/50 | 250/60 | ap/2+rand>dp |
| weituo-gun/fumo | direct | WEAPON/60 | 300/100 | ap/2+rand>dp |
| xiuluo-dao/suoming | direct | WEAPON/60 | 180/60 | ap/2+rand>dp |
| yizhi-chan/jingmo | direct | UNARMED/50 | 100/60 | ap/2+rand>dp |
| yingzhua-gong/chumo | direct | UNARMED/45 | 200/40 | ap/2+rand>dp |
| damo-jian/qingxin | control | 无 | 200/200 | 目标须 powerup |
| riyue-bian/chan | control | 无 | 0/0 | ap/2+rand>dp |
| banruo-zhang/feng | buff | 无 | 100 | 无需目标 |
| cibei-dao/sheshen | buff | 无 | 100 | 无 |
| jingang-quan/jingang | buff | 无 | 150 | 少林内功硬约束 |
| zui-gun/zuida | buff | 无 | 150 | 少林内功+powerup 互斥 |
| damo-jian/sanjue | combo | 3×attack | 75 | 无 |
| riyue-bian/he | combo | 5-10×attack | 变动 | ap/2+rand(ap*2)>dp |
| wuchang-zhang/wuchang | combo | 5×attack | 100 | 无 |

## 源码路径

绝招：damo-jian/{luan,qingxin,sanjue,shang,zhe}.c、riyue-bian/{chan,he,shang}.c、banruo-zhang/feng.c、cibei-dao/sheshen.c、fumo-jian/foxin.c、jingang-quan/jingang.c、qianye-shou/qianye.c、pudu-zhang/zhao.c、weituo-gun/fumo.c、wuchang-zhang/wuchang.c、xiuluo-dao/suoming.c、yizhi-chan/jingmo.c、yingzhua-gong/chumo.c、zui-gun/zuida.c

母技能：14 个 kungfu/skill/*.c（valid_learn 边界见预研原文）
