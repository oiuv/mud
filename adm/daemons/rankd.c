// rankd.c

// #pragma optimize
// #pragma save_binary

#include <ansi.h>

string query_rank(object ob)
{
        mapping fam;

        int shen;
        int budd;
        int tao;
        int exp;
        int age;

        if (ob->is_ghost())
                return HIB "【 鬼  魂 】" NOR;
                
        if (ob->query("reborn"))
                return HIW "【"HIY"元"HIR"神"HIG"转"HIC"世"HIW"】" NOR;

	if (ob->query("rank_info/rank"))
		return HIY "【" + ob->query("rank_info/rank") + "】" NOR;

        shen = ob->query("shen");
        exp  = ob->query("combat_exp");
        age  = ob->query("age");
        fam  = ob->query("family/family_name");
        budd = ob->query_skill("buddhism", 1);
        tao  = ob->query_skill("taoism", 1);

	if (exp > 50000000)
	{
                if (ob->query("gender") == "无性")
                        return HIC "【 九千岁 】" NOR;

                switch (fam)
                {
                case "少林派":
                        return HIC "【 圣  僧 】" NOR;
                case "武当派":
                        return HIC "【 天  尊 】" NOR;
                case "峨嵋派":
                        return HIC "【 圣  尼 】" NOR;
                case "逍遥派":
                        return HIC "【 逸  仙 】" NOR;
                case "灵鹫宫":
                        return HIC "【天山姥姥】" NOR;
                case "星宿派":
                        return HIC "【星宿老怪】" NOR;
                case "古墓派":
                        return HIC "【 神  侠 】" NOR;
                case "全真教":
                        return HIC "【 中神通 】" NOR;
                case "昆仑派":
                        return HIC "【 三  圣 】" NOR;
                case "桃花岛":
                        return HIC "【 东  邪 】" NOR;
                case "药王谷":
                        return HIC "【毒手药王】" NOR;
                case "血刀门":
                        return HIC "【血刀老祖】" NOR;
                case "大轮寺":
                        return HIC "【不动明王】" NOR;
                case "丐帮":
                        return HIC "【 北  丐 】" NOR;
                case "铁掌帮":
                        return HIC "【 帮  主 】" NOR;
                case "天地会":
                        return HIC "【 英  雄 】" NOR;
                case "红花会":
                        return HIC "【旷世大侠】" NOR;
                case "神龙教":
                        return HIC "【神龙教主】" NOR;
                case "五毒教":
                        return HIC "【毒手残心】" NOR;
                case "明教":
                        return HIC "【光明圣使】" NOR;
                case "梅庄":
                        return HIC "【 庄  主 】" NOR;
                case "崆峒派":
                        return HIC "【 拳  王 】" NOR;
                case "铁剑门":
                        return HIC "【 剑  隐 】" NOR;
                case "玄冥谷":
                        return HIC "【玄冥老人】" NOR;
                case "天龙寺":
                        return HIC "【 圣  僧 】" NOR;
                case "青城派":
                        return HIC "【 剑  邪 】" NOR;
                case "嵩山派":
                        return HIC "【 剑  帝 】" NOR;
                case "恒山派":
                        return HIC "【 剑  仙 】" NOR;
                case "衡山派":
                        return HIC "【 剑  皇 】" NOR;
                case "泰山派":
                        return HIC "【 剑  神 】" NOR;
                case "华山派":
                        return HIC "【 剑  圣 】" NOR;
                case "华山剑宗":
                        return HIC "【 剑  魔 】" NOR;
                case "连城剑派":
                        return HIC "【 剑  邪 】" NOR;
                case "凌霄城":
                        return HIC "【 剑  狂 】" NOR;
                case "日月神教":
                        return HIC "【日月圣尊】" NOR;
                case "八卦门":
                        return HIC "【 武  圣 】" NOR;
                case "欧阳世家":
                        return HIC "【 西  毒 】" NOR;
                case "慕容世家":
                        return HIC "【 大燕皇 】" NOR;
                case "关外胡家":
                        return HIC "【雪山飞狐】" NOR;
                case "中原苗家":
                        return HIC "【剑胆佛心】" NOR;
                case "商家堡":
                        return HIC "【 堡  主 】" NOR;
                case "段氏皇族":
                        return HIC "【 南  帝 】" NOR;
                case "石梁温家":
                        return HIC "【 堡  主 】" NOR;
                case "绝情谷":
                        return HIC "【 谷  主 】" NOR;
                case "江南丁氏":
                        return HIC "【 庄  主 】" NOR;
                default:
                        return HIC "【武林神话】" NOR;
                }
	} else
	if (exp >10000000)
	{
                if (ob->query("gender") == "无性")
                        return HIY "【大内高手】" NOR;

                switch (fam)
                {
                case "少林派":
                        return HIY "【 神  僧 】" NOR;
                case "武当派":
                        return HIY "【 真  人 】" NOR;
                case "峨嵋派":
                        return HIY "【 神  尼 】" NOR;
                case "逍遥派":
                        return HIY "【 护  法 】" NOR;
                case "灵鹫宫":
                        return HIY "【灵鹫左使】" NOR;
                case "星宿派":
                        return HIY "【 毒圣手 】" NOR;
                case "古墓派":
                        return HIY "【 隐  侠 】" NOR;
                case "全真教":
                        return HIY "【 真  人 】" NOR;
                case "昆仑派":
                        return HIY "【 武  狂 】" NOR;
                case "桃花岛":
                        return HIY "【 半  邪 】" NOR;
                case "药王谷":
                        return HIY "【 药  圣 】" NOR;
                case "血刀门":
                        return HIY "【 刀  霸 】" NOR;
                case "大轮寺":
                        return HIY "【 法  王 】" NOR;
                case "丐帮":
                        return HIY "【 神  丐 】" NOR;
                case "铁掌帮":
                        return HIY "【 坛  主 】" NOR;
                case "天地会":
                        return HIY "【 英  豪 】" NOR;
                case "红花会":
                        return HIY "【 英  豪 】" NOR;
                case "神龙教":
                        return HIY "【神龙无敌】" NOR;
                case "五毒教":
                        return HIY "【 毒  王 】" NOR;
                case "明教":
                        return HIY "【 法  王 】" NOR;
                case "梅庄":
                        return HIY "【 乐  神 】" NOR;
                case "崆峒派":
                        return HIY "【 长  老 】" NOR;
                case "铁剑门":
                        return HIY "【神行剑侠】" NOR;
                case "玄冥谷":
                        return HIY "【玄冥神掌】" NOR;
                case "天龙寺":
                        return HIY "【 神  僧 】" NOR;
                case "青城派":
                        return HIY "【 剑  豪 】" NOR;
                case "嵩山派":
                        return HIY "【 剑  豪 】" NOR;
                case "恒山派":
                        return HIY "【 剑  豪 】" NOR;
                case "衡山派":
                        return HIY "【 剑  豪 】" NOR;
                case "泰山派":
                        return HIY "【 剑  豪 】" NOR;
                case "华山派":
                        return HIY "【 剑  豪 】" NOR;
                case "华山剑宗":
                        return HIY "【 剑  豪 】" NOR;
                case "连城剑派":
                        return HIY "【 剑  豪 】" NOR;
                case "凌霄城":
                        return HIY "【 剑  豪 】" NOR;
                case "日月神教":
                        return HIY "【圣教长老】" NOR;
                case "八卦门":
                        return HIY "【 武  神 】" NOR;
                case "欧阳世家":
                        return HIY "【 蛇  魔 】" NOR;
                case "慕容世家":
                        return HIY "【 皇  尊 】" NOR;
                case "关外胡家":
                        return HIY "【 刀  王 】" NOR;
                case "中原苗家":
                        return HIY "【 剑  圣 】" NOR;
                case "商家堡":
                        return HIY "【 刀  霸 】" NOR;
                case "段氏皇族":
                        return HIY "【 镇南王 】" NOR;
                case "石梁温家":
                        return HIY "【 二当家 】" NOR;
                case "绝情谷":
                        return HIY "【 总  管 】" NOR;
                case "江南丁氏":
                        return HIY "【 怒无常 】" NOR;
                default:
                        return HIY "【武林泰斗】" NOR;
                }
	} else
	if (exp > 5000000)
	{
                if (ob->query("gender") == "无性")
                        return HIR "【东厂万户】" NOR;

                switch (fam)
                {
                case "少林派":
                        return HIR "【 长  老 】" NOR;
                case "武当派":
                        return HIR "【 天  师 】" NOR;
                case "峨嵋派":
                        return HIR "【 德  尼 】" NOR;
                case "逍遥派":
                        return HIR "【 逸  士 】" NOR;
                case "灵鹫宫":
                        return HIR "【灵鹫右使】" NOR;
                case "星宿派":
                        return HIR "【星宿毒师】" NOR;
                case "古墓派":
                        return HIR "【 游  侠 】" NOR;
                case "全真教":
                        return HIR "【 天  师 】" NOR;
                case "昆仑派":
                        return HIR "【 棋  王 】" NOR;
                case "桃花岛":
                        return HIR "【 药  王 】" NOR;
                case "药王谷":
                        return HIR "【 药  仙 】" NOR;
                case "血刀门":
                        return HIR "【 刀  邪 】" NOR;
                case "大轮寺":
                        return HIR "【 国  师 】" NOR;
                case "丐帮":
                        return HIR "【 铁  丐 】" NOR;
                case "铁掌帮":
                        return HIR "【 香  主 】" NOR;
                case "天地会":
                        return HIR "【 豪  杰 】" NOR;
                case "红花会":
                        return HIR "【 豪  杰 】" NOR;
                case "神龙教":
                        return HIR "【 白龙使 】" NOR;
                case "五毒教":
                        return HIR "【 毒  仆 】" NOR;
                case "明教":
                        return HIR "【 散  人 】" NOR;
                case "梅庄":
                        return HIR "【 画  圣 】" NOR;
                case "崆峒派":
                        return HIR "【 天  师 】" NOR;
                case "铁剑门":
                        return HIR "【千手剑侠】" NOR;
                case "玄冥谷":
                        return HIR "【玄冥护法】" NOR;
                case "天龙寺":
                        return HIR "【 长  老 】" NOR;
                case "青城派":
                        return HIR "【 剑  侠 】" NOR;
                case "嵩山派":
                        return HIR "【 剑  侠 】" NOR;
                case "恒山派":
                        return HIR "【 剑  侠 】" NOR;
                case "衡山派":
                        return HIR "【 剑  侠 】" NOR;
                case "泰山派":
                        return HIR "【 剑  侠 】" NOR;
                case "华山派":
                        return HIR "【 剑  侠 】" NOR;
                case "华山剑宗":
                        return HIR "【 剑  侠 】" NOR;
                case "连城剑派":
                        return HIR "【 剑  侠 】" NOR;
                case "凌霄城":
                        return HIR "【 剑  侠 】" NOR;
                case "日月神教":
                        return HIR "【 护  法 】" NOR;
                case "八卦门":
                        return HIR "【 武  尊 】" NOR;
                case "欧阳世家":
                        return HIR "【 蛇  仆 】" NOR;
                case "慕容世家":
                        return HIR "【 家  臣 】" NOR;
                case "关外胡家":
                        return HIR "【 霸  刀 】" NOR;
                case "中原苗家":
                        return HIR "【 神  剑 】" NOR;
                case "商家堡":
                        return HIR "【 邪  刀 】" NOR;
                case "段氏皇族":
                        return HIR "【王府总管】" NOR;
                case "石梁温家":
                        return HIR "【 教  头 】" NOR;
                case "绝情谷":
                        return HIR "【 护  院 】" NOR;
                case "江南丁氏":
                        return HIR "【 喜无常 】" NOR;
                default:
                        return HIR "【武林豪杰】" NOR;
                }
	} else
	if (exp > 1000000)
	{
                if (ob->query("gender") == "无性")
                        return HIG "【东厂千户】" NOR;

                switch (fam)
                {
                case "少林派":
                        return HIG "【 罗  汉 】" NOR;
                case "武当派":
                        return HIG "【 道  长 】" NOR;
                case "峨嵋派":
                        return HIG "【 贤  尼 】" NOR;
                case "逍遥派":
                        return HIG "【 隐  士 】" NOR;
                case "灵鹫宫":
                        return HIG "【 洞  主 】" NOR;
                case "星宿派":
                        return HIG "【星宿护卫】" NOR;
                case "古墓派":
                        return HIG "【 少  侠 】" NOR;
                case "全真教":
                        return HIG "【 道  长 】" NOR;
                case "昆仑派":
                        return HIG "【 琴  痴 】" NOR;
                case "桃花岛":
                        return HIG "【 卜算子 】" NOR;
                case "药王谷":
                        return HIG "【 药  神 】" NOR;
                case "血刀门":
                        return HIG "【僧兵头领】" NOR;
                case "大轮寺":
                        return HIG "【僧兵头领】" NOR;
                case "丐帮":
                        return HIG "【 侠  丐 】" NOR;
                case "铁掌帮":
                        return HIG "【 堂  主 】" NOR;
                case "天地会":
                        return HIG "【 大  侠 】" NOR;
                case "红花会":
                        return HIG "【 大  侠 】" NOR;
                case "神龙教":
                        return HIG "【 青龙使 】" NOR;
                case "五毒教":
                        return HIG "【 教  徒 】" NOR;
                case "明教":
                        return HIG "【 旗  主 】" NOR;
                case "梅庄":
                        return HIG "【 总  管 】" NOR;
                case "崆峒派":
                        return HIG "【 道  长 】" NOR;
                case "铁剑门":
                        return HIG "【 剑  客 】" NOR;
                case "玄冥谷":
                        return HIG "【武林高手】" NOR;
                case "天龙寺":
                        return HIG "【 罗  汉 】" NOR;
                case "青城派":
                        return HIG "【 剑  客 】" NOR;
                case "嵩山派":
                        return HIG "【 剑  客 】" NOR;
                case "恒山派":
                        return HIG "【 剑  客 】" NOR;
                case "衡山派":
                        return HIG "【 剑  客 】" NOR;
                case "泰山派":
                        return HIG "【 剑  客 】" NOR;
                case "华山派":
                        return HIG "【 剑  客 】" NOR;
                case "华山剑宗":
                        return HIG "【 剑  客 】" NOR;
                case "连城剑派":
                        return HIG "【 剑  客 】" NOR;
                case "凌霄城":
                        return HIG "【 剑  客 】" NOR;
                case "日月神教":
                        return HIG "【 护  教 】" NOR;
                case "八卦门":
                        return HIG "【 武  师 】" NOR;
                case "欧阳世家":
                        return HIG "【 总  管 】" NOR;
                case "慕容世家":
                        return HIG "【 总  管 】" NOR;
                case "关外胡家":
                        return HIG "【 总  管 】" NOR;
                case "中原苗家":
                        return HIG "【 总  管 】" NOR;
                case "商家堡":
                        return HIG "【 总  管 】" NOR;
                case "段氏皇族":
                        return HIG "【侍卫首领】" NOR;
                case "石梁温家":
                        return HIG "【 总  管 】" NOR;
                case "绝情谷":
                        return HIG "【 总  管 】" NOR;
                case "江南丁氏":
                        return HIG "【 总  管 】" NOR;
                default:
                        return HIG "【武林高手】" NOR;
                }
	} else
	if (exp > 500000)
	{
                if (ob->query("gender") == "无性")
                        return CYN "【东厂百户】" NOR;

                switch (fam)
                {
                case "少林派":
                        return CYN "【 尊  者 】" NOR;
                case "武当派":
                        return CYN "【 道  士 】" NOR;
                case "峨嵋派":
                        return CYN "【 师  太 】" NOR;
                case "逍遥派":
                        return CYN "【 方  士 】" NOR;
                case "灵鹫宫":
                        return CYN "【 仕  女 】" NOR;
                case "星宿派":
                        return CYN "【 小毒虫 】" NOR;
                case "古墓派":
                        return CYN "【江湖豪杰】" NOR;
                case "全真教":
                        return CYN "【 道  士 】" NOR;
                case "昆仑派":
                        return CYN "【江湖豪杰】" NOR;
                case "桃花岛":
                        return CYN "【 秀  才 】" NOR;
                case "药王谷":
                        return CYN "【 方  士 】" NOR;
                case "血刀门":
                        return CYN "【 僧  兵 】" NOR;
                case "大轮寺":
                        return CYN "【 僧  兵 】" NOR;
                case "丐帮":
                        return CYN "【 义  丐 】" NOR;
                case "铁掌帮":
                        return CYN "【 教  头 】" NOR;
                case "天地会":
                        return CYN "【 侠  客 】" NOR;
                case "红花会":
                        return CYN "【 侠  客 】" NOR;
                case "神龙教":
                        return CYN "【 赤龙使 】" NOR;
                case "五毒教":
                        return CYN "【 教  众 】" NOR;
                case "明教":
                        return CYN "【 门  主 】" NOR;
                case "梅庄":
                        return CYN "【 护  院 】" NOR;
                case "崆峒派":
                        return CYN "【 道  士 】" NOR;
                case "铁剑门":
                        return CYN "【 剑  士 】" NOR;
                case "玄冥谷":
                        return CYN "【 护  院 】" NOR;
                case "天龙寺":
                        return CYN "【 尊  者 】" NOR;
                case "青城派":
                        return CYN "【 剑  士 】" NOR;
                case "嵩山派":
                        return CYN "【 剑  士 】" NOR;
                case "恒山派":
                        return CYN "【 剑  士 】" NOR;
                case "衡山派":
                        return CYN "【 剑  士 】" NOR;
                case "泰山派":
                        return CYN "【 剑  士 】" NOR;
                case "华山派":
                        return CYN "【 剑  士 】" NOR;
                case "华山剑宗":
                        return CYN "【 剑  士 】" NOR;
                case "连城剑派":
                        return CYN "【 剑  士 】" NOR;
                case "凌霄城":
                        return CYN "【 剑  士 】" NOR;
                case "日月神教":
                        return CYN "【 堂  主 】" NOR;
                case "八卦门":
                        return CYN "【 武  者 】" NOR;
                case "欧阳世家":
                        return CYN "【 护  院 】" NOR;
                case "慕容世家":
                        return CYN "【 护  院 】" NOR;
                case "关外胡家":
                        return CYN "【 护  院 】" NOR;
                case "中原苗家":
                        return CYN "【 护  院 】" NOR;
                case "商家堡":
                        return CYN "【 护  院 】" NOR;
                case "段氏皇族":
                        return CYN "【王府侍卫】" NOR;
                case "石梁温家":
                        return CYN "【 护  院 】" NOR;
                case "绝情谷":
                        return CYN "【 护  院 】" NOR;
                case "江南丁氏":
                        return CYN "【 护  院 】" NOR;
                default:
                        return CYN "【武林异士】" NOR;
                }
	} else
	if (exp > 100000)
	{
                if (ob->query("gender") == "无性")
                        return YEL "【东厂十户】" NOR;

                switch (fam)
                {
                case "少林派":
                        return YEL "【 禅  师 】" NOR;
                case "武当派":
                        return YEL "【 小道士 】" NOR;
                case "峨嵋派":
                        return YEL "【 尼  姑 】" NOR;
                case "逍遥派":
                        return YEL "【 郎  中 】" NOR;
                case "灵鹫宫":
                        return YEL "【 侍  女 】" NOR;
                case "星宿派":
                        return YEL "【 弟  子 】" NOR;
                case "古墓派":
                        return YEL "【武林中人】" NOR;
                case "全真教":
                        return YEL "【 小道士 】" NOR;
                case "昆仑派":
                        return YEL "【武林中人】" NOR;
                case "桃花岛":
                        return YEL "【 书  生 】" NOR;
                case "药王谷":
                        return YEL "【 药  师 】" NOR;
                case "血刀门":
                        return YEL "【 喇  嘛 】" NOR;
                case "大轮寺":
                        return YEL "【 喇  嘛 】" NOR;
                case "丐帮":
                        return YEL "【 乞  丐 】" NOR;
                case "铁掌帮":
                        return YEL "【 帮  众 】" NOR;
                case "天地会":
                        return YEL "【 侠  士 】" NOR;
                case "红花会":
                        return YEL "【 侠  士 】" NOR;
                case "神龙教":
                        return YEL "【 随龙使 】" NOR;
                case "五毒教":
                        return YEL "【初入江湖】" NOR;
                case "明教":
                        return YEL "【 教  徒 】" NOR;
                case "梅庄":
                        return YEL "【 随  从 】" NOR;
                case "崆峒派":
                        return YEL "【 小道士 】" NOR;
                case "铁剑门":
                        return YEL "【 剑  童 】" NOR;
                case "玄冥谷":
                        return YEL "【 护  卫 】" NOR;
                case "天龙寺":
                        return YEL "【 禅  师 】" NOR;
                case "青城派":
                        return YEL "【 剑  侍 】" NOR;
                case "嵩山派":
                        return YEL "【 剑  侍 】" NOR;
                case "恒山派":
                        return YEL "【 剑  侍 】" NOR;
                case "衡山派":
                        return YEL "【 剑  侍 】" NOR;
                case "泰山派":
                        return YEL "【 剑  侍 】" NOR;
                case "华山派":
                        return YEL "【 剑  侍 】" NOR;
                case "华山剑宗":
                        return YEL "【 剑  侍 】" NOR;
                case "连城剑派":
                        return YEL "【 剑  侍 】" NOR;
                case "凌霄城":
                        return YEL "【 剑  侍 】" NOR;
                case "日月神教":
                        return YEL "【 教  徒 】" NOR;
                case "八卦门":
                        return YEL "【 镖  师 】" NOR;
                case "欧阳世家":
                        return YEL "【 随  从 】" NOR;
                case "慕容世家":
                        return YEL "【 随  从 】" NOR;
                case "关外胡家":
                        return YEL "【 随  从 】" NOR;
                case "中原苗家":
                        return YEL "【 随  从 】" NOR;
                case "商家堡":
                        return YEL "【 随  从 】" NOR;
                case "段氏皇族":
                        return YEL "【 侍  卫 】" NOR;
                case "石梁温家":
                        return YEL "【 随  从 】" NOR;
                case "绝情谷":
                        return YEL "【 随  从 】" NOR;
                case "江南丁氏":
                        return YEL "【 随  从 】" NOR;
                default:
                        return YEL "【武林人士】" NOR;
                }
	} else
	{
                if (ob->query("gender") == "无性")
                        return GRN "【 公  公 】" NOR;

                switch (fam)
                {
                case "少林派":
                        return GRN "【 比  丘 】" NOR;
                case "武当派":
                        return GRN "【 道  童 】" NOR;
                case "峨嵋派":
                        return GRN "【 小尼姑 】" NOR;
                case "逍遥派":
                        return GRN "【 学  童 】" NOR;
                case "灵鹫宫":
                        return GRN "【 使  女 】" NOR;
                case "星宿派":
                        return GRN "【 仆  人 】" NOR;
                case "古墓派":
                        return GRN "【初入江湖】" NOR;
                case "全真教":
                        return GRN "【 道  童 】" NOR;
                case "昆仑派":
                        return GRN "【 弟  子 】" NOR;
                case "桃花岛":
                        return GRN "【 学  童 】" NOR;
                case "药王谷":
                        return GRN "【 药  童 】" NOR;
                case "血刀门":
                        return GRN "【 沙  弥 】" NOR;
                case "大轮寺":
                        return GRN "【 沙  弥 】" NOR;
                case "丐帮":
                        return GRN "【 小叫花 】" NOR;
                case "铁掌帮":
                        return GRN "【 仆  人 】" NOR;
                case "天地会":
                        return GRN "【 义  士 】" NOR;
                case "红花会":
                        return GRN "【 义  士 】" NOR;
                case "神龙教":
                        return GRN "【 弟  子 】" NOR;
                case "五毒教":
                        return GRN "【 仆  人 】" NOR;
                case "明教":
                        return GRN "【 教  众 】" NOR;
                case "梅庄":
                        return GRN "【 仆  人 】" NOR;
                case "崆峒派":
                        return GRN "【 道  童 】" NOR;
                case "铁剑门":
                        return GRN "【 剑  童 】" NOR;
                case "玄冥谷":
                        return GRN "【 仆  人 】" NOR;
                case "天龙寺":
                        return GRN "【 比  丘 】" NOR;
                case "青城派":
                        return GRN "【 剑  童 】" NOR;
                case "嵩山派":
                        return GRN "【 剑  童 】" NOR;
                case "恒山派":
                        return GRN "【 剑  童 】" NOR;
                case "衡山派":
                        return GRN "【 剑  童 】" NOR;
                case "泰山派":
                        return GRN "【 剑  童 】" NOR;
                case "华山派":
                        return GRN "【 剑  童 】" NOR;
                case "华山剑宗":
                        return GRN "【 剑  童 】" NOR;
                case "连城剑派":
                        return GRN "【 剑  童 】" NOR;
                case "凌霄城":
                        return GRN "【 剑  童 】" NOR;
                case "日月神教":
                        return GRN "【 教  众 】" NOR;
                case "八卦门":
                        return GRN "【 趟子手 】" NOR;
                case "欧阳世家":
                        return GRN "【 家  丁 】" NOR;
                case "慕容世家":
                        return GRN "【 家  丁 】" NOR;
                case "关外胡家":
                        return GRN "【 家  丁 】" NOR;
                case "中原苗家":
                        return GRN "【 家  丁 】" NOR;
                case "商家堡":
                        return GRN "【 家  丁 】" NOR;
                case "段氏皇族":
                        return GRN "【 侍  从 】" NOR;
                case "石梁温家":
                        return GRN "【 家  丁 】" NOR;
                case "绝情谷":
                        return GRN "【 家  丁 】" NOR;
                case "江南丁氏":
                        return GRN "【 家  丁 】" NOR;
                default:
                        return GRN "【初入武林】" NOR;
                }
	}
}

string query_respect(object ob)
{
        int age;
        string str;

        if (stringp(str = ob->query("rank_info/respect")))
                return str;

        if ((string)ob->query("id") == "ivy")
		return "神仙哥哥";

        age = ob->query("age");
        switch (ob->query("gender"))
        {
        case "女性":
                switch(ob->query("class"))
                {
                case "bonze":
                        if (age < 18) return "小师太";
                        else return "师太";
                        break;
                case "taoist":
                        if (age < 18) return "小仙姑";
                        else return "仙姑";
                        break;
                default:
                        if (age < 18) return "小姑娘";
                        else if (age < 30) return "姑娘";
                        else if (age < 40) return "大婶";
                        else return "婆婆";
                        break;
                }
        case "男性":
        default:
                switch(ob->query("class"))
                {
                case "bonze":
                        if (age < 18) return "小师父";
                        else return "大师";
                        break;
                case "taoist":
                        if (age < 18) return "道兄";
                        else return "道长";
                        break;
                case "scholar":
                        if (age < 18) return "小相公";
                        else if (age < 50) return "相公";
                        else return "老先生";
                        break;
                case "fighter":
                case "swordsman":
                        if (age < 18) return "小老弟";
                        else if (age < 50) return "壮士";
                        else return "老前辈";
                        break;
                default:
                        if (age < 20) return "小兄弟";
                        else if (age < 50) return "壮士";
                        else return "老爷子";
                        break;
                }
        }
}

string query_rude(object ob)
{
        int age;
        string str;

        if (stringp(str = ob->query("rank_info/rude")))
                return str;

        if ((string)ob->query("id") == "ivy")
		return "大神";

        age = ob->query("age");
        switch (ob->query("gender"))
        {
        case "女性":
                switch(ob->query("class"))
                {
                case "bonze":
                        if( age < 18 ) return "小贼尼";
                        if( age < 30 ) return "贼尼";
                        else return "老贼尼";
                        break;
                case "taoist":
                        if( age < 18 ) return "小妖女";
                        if( age < 30 ) return "妖女";
                        else return "老妖婆";
                        break;
                default:
                        if( age < 18 ) return "小娘皮";
                        if( age < 25 ) return "小贱人";
                        if( age < 40 ) return "贼婆娘";
                        else return "死老太婆";
                        break;
                }
        case "男性":
        default:
                switch(ob->query("class"))
                {
                case "bonze":
                        if( age < 18 ) return "小贼秃";
                        if( age < 50 ) return "死秃驴";
                        else return "老秃驴";
                        break;
                case "taoist":
                        if( age < 18 ) return "小杂毛";
                        if( age < 30 ) return "死牛鼻子";
                        else return "老杂毛";
                        break;
                case "scholar":
                        if( age < 18 ) return "小书呆子";
                        else if( age < 50 ) return "臭书呆子";
                        else return "老童生";
                        break;
                default:
                        if (age < 18) return "小兔崽子";
                        if (age < 20) return "小王八蛋";
                        if (age < 30) return "直娘贼";
                        if (age < 50) return "臭贼";
                        if (age < 80) return "老匹夫";
                        else return "老不死";
                        break;
                }
        }
}

string query_self(object ob)
{
        int age;
        string str;

        if (stringp(str = ob->query("rank_info/self")))
                return str;

        if ((string)ob->query("id") == "ivy")
		return "我";

        age = ob->query("age");
        switch (ob->query("gender"))
        {
        case "女性":
                switch(ob->query("class"))
                {
                case "bonze":
                        if( age < 50 ) return "贫尼";
                        else return "老尼";
                        break;
                case "taoist":
                        return "贫道";
                        break;
                default:
                        if( age < 20 ) return "小女子";
                        if( age > 50 ) return "老身";
                        else return "妾身";
                        break;
                }
        case "男性":
        default:
                switch(ob->query("class"))
                {
                case "bonze":
                        if( age < 18 ) return "小衲";
                        if( age < 40 ) return "贫僧";
                        else return "老衲";
                        break;
                case "taoist":
                        if( age < 18 ) return "小道";
                        if( age < 30 ) return "贫道";
                        else return "老道";
                        break;
                case "scholar":
                        if( age < 30 ) return "晚生";
                        else return "不才";
                        break;
                default:
                        if( age < 50 ) return "在下";
                        else return "老头子";
                        break;
                }
        }
}

string query_self_rude(object ob)
{
        int age;
        string str;

        if (stringp(str = ob->query("rank_info/self_rude")))
                return str;

        if ((string)ob->query("id") == "ivy")
		return "本仙";

        age = ob->query("age");
        switch(ob->query("gender"))
        {
        case "女性":
                switch(ob->query("class"))
                {
                case "bonze":
                        if( age < 50 ) return "贫尼";
                        else return "老尼";
                        break;
                case "taoist":
                        return "本仙姑";
                        break;
                default:
                        if( age < 20 ) return "本姑娘";
                        if( age < 30 ) return "本姑奶奶";
                        else return "老娘";
                        break;
                }
        case "男性":
        default:
                switch(ob->query("class"))
                {
                case "bonze":
                        if( age < 50 ) return "大和尚我";
                        else return "老和尚我";
                        break;
                case "taoist":
                        if( age < 30 ) return "本山人";
                        return "老道我";
                        break;
                case "scholar":
                        if( age < 50 ) return "本相公";
                        else return "老夫子我";
                        break;
                default:
                        if( age < 20 ) return "本少爷我";
                        if( age < 40 ) return "大爷我";
                        else return "老子";
                        break;
                }
        }
}

varargs string query_close(mixed ob, int a1, int a2)
{
        if (! a1 && this_player())
                a1 = this_player()->query("age");

        if (! a2 && objectp(ob))
                a2 = ob->query("age");

        switch (objectp(ob) ? ob->query("gender") : ob)
        {
        case "女性":
                if (a1 >= a2)
                        return "妹妹";
                else
                        return "姐姐";
                break;

        default:
                if (a1 >= a2)
                        return "弟弟";
                else
                        return "哥哥";
        }
}

varargs string query_self_close(mixed ob, mixed me, int a1, int a2)
{
        if (! a1 && this_player())
                a1 = this_player()->query("age");

        if (! a2 && objectp(ob))
                a2 = ob->query("age");

        switch (objectp(me) ? me->query("gender") :
                this_player() ? this_player()->query("gender") : me)
        {
        case "女性" :
                if (a1 >= a2)
                        return "姐姐我";
                else
                        return "小妹我";
                break;

        default :
                if (a1 >= a2)
                        return "愚兄我";
                else
                        return "小弟我";
        }
}

