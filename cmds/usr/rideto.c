// Copyright (C) 2003, by Lonely. All rights reserved.
// Modified by Ivy (2013-11-30 22:56:59)
// rideto.c

#include <ansi.h>

inherit F_CLEAN_UP;

int help(object me);

mapping places = ([
        "baituo"   : "/d/baituo/guangchang",       
        "beijing"  : "/d/beijing/tiananmen",
        "changan"  : "/d/changan/bridge2",
        "chengdu"  : "/d/city3/guangchang",
        "dali"     : "/d/dali/center",
        "emei"     : "/d/emei/huayanding",
        "foshan"   : "/d/foshan/street3",
        "fuzhou"   : "/d/fuzhou/dongjiekou",
        "gc"       : "/d/city/guangchang",
        "guanwai"  : "/d/guanwai/jishi",
        "guiyun"   : "/d/guiyun/taihu",
        "gumu"     : "/d/gumu/mumen",
        "hangzhou" : "/d/hangzhou/road10",
        "heimuya"  : "/d/heimuya/shimen",
        "hengyang"  : "/d/henshan/hengyang",
        "huashan"  : "/d/huashan/shaluo",
        "jiaxing"  : "/d/quanzhou/jiaxing",
        "jingzhou" : "/d/jingzhou/guangchang",
        "kaifeng"  : "/d/kaifeng/zhuque",
        "kunlun"   : "/d/kunlun/klshanlu",
        "kunming"  : "/d/kunming/jinrilou",
        "lanzhou"  : "/d/lanzhou/guangchang",
        "lingjiu"  : "/d/lingjiu/jian",
        "lingzhou" : "/d/lingzhou/center",
        "luoyang"  : "/d/luoyang/center",
        "mingjiao" : "/d/mingjiao/shanjiao",
        "murong"   : "/d/yanziwu/hupan",
        "nanhai"   : "/d/xiakedao/haibin",
        "nanyang"  : "/d/shaolin/nanyang",
        "quanzhen" : "/d/quanzhen/damen",
        "quanzhou" : "/d/quanzhou/zhongxin",
        "shaolin"  : "/d/shaolin/shanmen",
        "suzhou"   : "/d/suzhou/canlangting",
        "taishan"  : "/d/taishan/taishanjiao",
        //新增桃花岛 2018-06-02 
        "taohua"   : "/d/taohua/haitan",
        "wudang"   : "/d/wudang/jiejianyan",
        "wugong"   : "/d/quanzhen/zhongxin",
        "xiangyang": "/d/xiangyang/guangchang",
        "xiaoyao"  : "/d/xiaoyao/xiaodao4",        
        "xingxiu"  : "/d/xingxiu/xxh1",
        "xuedao"   : "/d/xuedao/wangyougu",
        "xueshan"  : "/d/xuedao/nroad4",
        "yangzhou" : "/d/city/guangchang",
        "yanziwu"  : "/d/yanziwu/bozhou",
        "yongdeng" : "/d/huanghe/yongdeng",
        "zhongnan" : "/d/quanzhen/shanjiao",
        "zhongzhou": "/d/zhongzhou/shizhongxin",
        //新增衡山 2017-02-11
        "hengshan" : "/d/henshan/nantian",
        //新增绝情谷、铁掌山 2017-02-18
        "jueqing"  : "/d/jueqing/shanjiao",
        "tiezhang" : "/d/tiezhang/shanjiao",
        	
        // "hujia"    : "/d/guanwai/xiaoyuan",
        // "tangmen"  : "/d/tangmen/",
        // "yaowang"  : "/d/yaowang/",
]);

int main(object me, string arg)
{
        object riding, room;
        string where;

        if (! arg) return help(me);

        if (me->over_encumbranced()) 
                return notify_fail("你的负荷过重，动弹不得。\n"); 
        
        if (me->query_encumbrance() < 0) 
                return notify_fail("你的负荷出现故障，动弹不得。\n"); 

        if (me->query_temp("sleeped")) 
                return notify_fail("你现在正躺着呢。\n");

        if (me->is_in_prison())   
                return notify_fail("你正在坐牢呢，你想干什么？！\n");
                                
        if (me->is_fighting()) 
                return notify_fail("你现在正在战斗！\n");

        if (me->is_busy() || me->query("doing")) 
                return notify_fail("你的动作还没有完成，不能移动。\n");
                
        if (! objectp(riding = me->query_temp("is_riding")))
                return notify_fail("你还没有坐骑！\n"); 
        
        if (! present(riding->query("id"), me))
                return notify_fail("你的坐骑不在你身边！\n");

        /*
        if (present("letter", me)) 
                return notify_fail("你身上带着密函！\n");

        if (! environment(me)->query("outdoors")) 
                return notify_fail("在房间里不能乱跑！\n");
        */

        if (environment(me)->query("outdoors") == "gaochang") 
                return notify_fail("你发现在这里坐骑好象不听你的指挥！\n");

        if (environment(me)->query("no_ride") ||
            environment(me)->query("maze"))
                return notify_fail("你发现这里有点古怪，你的坐骑好象不听你的指挥！\n");                

        if (me->query_condition("killer"))
                return notify_fail("你有命案在身呢，你想肆无忌惮的在官道上溜达？！\n");

        //if (member_array(arg, keys(places)) == -1 && arg != "home") 
        //新增family参数
        if (member_array(arg, keys(places)) == -1 && arg != "home" && arg != "family")
                return notify_fail("这个地方无法乘坐骑去。\n");
                
        if (arg == "home" && ! me->query("private_room/position")) 
                return notify_fail("你还没有住房呢！\n");

        if (arg == "home" && stringp(me->query("private_room/position")) &&
           file_size(me->query("private_room/position") + ".c") > 0)
                room = get_object(me->query("private_room/position"));else
                
		//新加family by 薪有所属
        // 特殊：古墓2个，绝情谷2个。拜裘千尺后自动转成铁掌帮，实际是铁掌帮有两个？
		//灵鹫下属小门派不管，已被关闭的门派不管。

         if (arg == "family") 
         	{
         		if (! me->query("family/family_name")) 
         			return notify_fail("你还没有门派，不能使用 rideto family 指令！\n");else
         			//if (me->query("combat_exp") < 1000000) return notify_fail("以你现在的经验还不够使用 rideto family 指令。\n");
         			//转世后取消100万exp限制
         			if (me->query("combat_exp") < 800000 && !me->query("reborn")) 
         				return notify_fail("以你现在的经验还不够使用 rideto family 指令。\n");
         				else 
         					{ if (me->query("family/family_name")=="少林派") room = get_object("/d/shaolin/fzlou2");else
         						if (me->query("family/family_name")=="慕容世家") room = get_object("/d/yanziwu/canheju");else
         						if (me->query("family/family_name")=="欧阳世家") room = get_object("/d/baituo/dating");else
         						if (me->query("family/family_name")=="玄冥谷") room = get_object("/d/xuanminggu/xuanmingfeng");else
         						if (me->query("family/family_name")=="昆仑派") room = get_object("/d/kunlun/tieqinju");else
         						if (me->query("family/family_name")=="逍遥派") room = get_object("/d/xiaoyao/qingcaop");else
         						if (me->query("family/family_name")=="八卦门") room = get_object("/d/beijing/zhengting");else
         						if (me->query("family/family_name")=="星宿派") room = get_object("/d/xingxiu/riyuedong");else
         					  if (me->query("family/family_name")=="大轮寺") room = get_object("/d/xueshan/neidian");else
         						if (me->query("family/family_name")=="五毒教") room = get_object("/d/wudu/huating1");else
         						if (me->query("family/family_name")=="桃花岛") room = get_object("/d/taohua/dating");else
         						if (me->query("family/family_name")=="血刀门") room = get_object("/d/xuedao/shandong3");else
         					  if (me->query("family/family_name")=="铁掌帮") room = get_object("/d/tiezhang/wztang");else
         					  //if (me->query("family/family_name")=="绝情谷") room = get_object("/d/jueqing/zizhuxuan");else
         						if (me->query("family/family_name")=="武当派") room = get_object("/d/wudang/xiaoyuan");else
         						if (me->query("family/family_name")=="梅庄") room = get_object("/d/meizhuang/houting");else
         						if (me->query("family/family_name")=="关外胡家") room = get_object("/d/guanwai/xiaowu");else
         						if (me->query("family/family_name")=="全真教") room = get_object("/d/quanzhen/shiweishi");else
         						if (me->query("family/family_name")=="中原苗家") room = get_object("/d/zhongzhou/miaojia_houting");else
         						if (me->query("family/family_name")=="红花会") room = get_object("/d/kaifeng/hh_zhengting");else
         						if (me->query("family/family_name")=="灵鹫宫") room = get_object("/d/lingjiu/dating");else
         						if (me->query("family/family_name")=="华山派") room = get_object("/d/huashan/qunxianguan");else
         					  if (me->query("family/family_name")=="段氏皇族") room = get_object("/d/dali/neitang");else
         						if (me->query("family/family_name")=="丐帮") room = get_object("/d/gaibang/undertre");else
         						if (me->query("family/family_name")=="衡山派") room = get_object("/d/henshan/zhurongfeng");else
         				    if (me->query("family/family_name")=="日月神教") room = get_object("/d/quanzhou/chating");else
         				    //补充遗漏的明教和峨嵋 2017-02-05
         				    if (me->query("family/family_name")=="明教") room = get_object("/d/mingjiao/dadian");else
         				    if (me->query("family/family_name")=="峨嵋派") room = get_object("/d/emei/hcahoudian");else
         				    //补充重新开放的嵩山 2017-02-07
         				    if (me->query("family/family_name")=="嵩山派") room = get_object("/d/songshan/fengchantai");else
         							//古墓分支
         						
         						if (me->query("family/family_name")=="古墓派") 
         											{if (me->query("family/master_name") == "李莫愁") 
         												room = get_object("/d/gumu/liangong3");
         												else room = get_object("/d/gumu/mishi8");
         												}
         				    else
         				    	//绝情分支					
         						if (me->query("family/family_name")=="绝情谷") 
         											{if (me->query("family/master_name") == "裘千尺") 
         												room = get_object("/d/jueqing/undertan");
         												else room = get_object("/d/jueqing/zizhuxuan");
         												}
         					
         						//灵鹫下属小门派以及已被关闭的门派。
         					 else	return notify_fail("你所在的门派无法使用 rideto family 直达任务使功能。\n");
         					  //return notify_fail("你所在的门派无法使用 rideto family 直达任务使功能。\n");																
         																					
         						}
         		}
         //新加family结束
     
        else
        room = get_object(places[arg]);
        if (! room) return notify_fail("你感觉到似乎那个地方有点不对劲。\n");
        
        message("vision", me->name() + "骑着「" + riding->name() + NOR "」匆匆忙忙地离开了。\n",
                environment(me), ({me}));
        
        where = room->query("short");
        
        tell_object(me, "你一路马不停蹄，风尘仆仆的赶到了" + where + "。\n");
        me->move(room);

        message("vision", me->name() + "骑着「" + riding->name() + NOR "」一路疾驰而来。\n",
                environment(me), ({me}));

        // me->receive_damage("qi", 10);

        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : rideto <地点>

利用坐骑到达某个地点。目前可以利用坐骑去的地方有：
baituo   : 白驼山        beijing  : 北  京        changan  : 长  安
chengdu  : 成  都        dali     : 大  理        emei     : 峨眉山
foshan   : 佛  山        fuzhou   : 福  州        guanwai  : 关  外
guiyun   : 归云庄        gumu     : 古  墓        hangzhou : 杭  州
heimuya  : 黑木崖        hengyang : 衡  阳        huashan  : 华  山
jiaxing  : 嘉  兴        jingzhou : 荆  州        kaifeng  : 开  封
kunlun   : 昆仑山        kunming  : 昆  明        lanzhou  : 兰  州
lingjiu  : 灵鹫宫        lingzhou : 灵  州        luoyang  : 洛  阳
mingjiao : 光明顶        murong   : 慕  容        nanhai   : 南  海
nanyang  : 南  阳        quanzhen : 全真教        quanzhou : 泉  州
suzhou   : 苏  州        taishan  : 泰  山        wudang   : 武当山
wugong   : 武功镇        xiangyang: 襄  阳        xiaoyao  : 逍遥林
xingxiu  : 星宿海        xuedao   : 血刀门        xueshan  : 雪  山
yangzhou : 扬  州        yanziwu  : 燕子坞        yongdeng : 永  登
zhongnan : 终南山        zhongzhou: 中  州        hengshan : 衡  山
jueqing  : 绝情谷        tiezhang : 铁掌山        taohua   : 桃花岛 
home     : 住  房        family   : 任务使

注：rideto family 可直达门派任务使。只限有门派的人使用，且exp需达到80万。

HELP
        );

        return 1;
}
 
