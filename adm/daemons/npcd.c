// npcd.c

// #pragma optimize
// #pragma save_binary

#include <command.h>
#include <user.h>
#include <npc/name.h>
#include <npc/chinese.c>
#include <npc/japanese.c>
#include <npc/european.c>
#include <npc/masia.c>
#include <npc/indian.c>

#define HUANG_SHANG             "/kungfu/class/ultra/huang"
#define DUGU_QIUBAI             "/kungfu/class/ultra/dugu"
#define KUIHUA_TAIJIAN          "/kungfu/class/ultra/kuihua"
#define HUO_SHAN                "/kungfu/class/ultra/huoshan"


mapping place = ([
        "洛阳城"   : ({ "/d/luoyang/xidoor", "/d/luoyang/beidoor",
                        "/d/luoyang/dongdoor", "/d/luoyang/nandoor",
                        "/d/luoyang/juyi", "/d/luoyang/nantou",
                        "/d/luoyang/suanming", "/d/luoyang/laofang",
                        "/d/luoyang/center", "/d/luoyang/nantou2", }),
        "北京城"   : ({ "/d/beijing/tiananmen", "/d/beijing/dianmen",
                        "/d/beijing/huangling", "/d/beijing/wenmiao",
                        "/d/beijing/xingchang", "/d/beijing/minju_y",
                        "/d/beijing/mianguan", "/d/beijing/yong_3",
                        "/d/beijing/tiantan", "/d/beijing/caishi", }),
        "长安城"   : ({ "/d/changan/dong-chengmen", "/d/changan/nan-chengmen",
                        "/d/changan/xi-chengmen", "/d/changan/bei-chengmen",
                        "/d/changan/qinglong2", "/d/changan/baihu2", }),
        "开封城"   : ({ "/d/kaifeng/road4", "/d/kaifeng/zhuque",
                        "/d/kaifeng/yanqing", "/d/kaifeng/huiguan",
                        "/d/kaifeng/nanying", "/d/kaifeng/fangsheng", }),
        "中州城"   : ({ "/d/zhongzhou/shizhongxin", "/d/zhongzhou/nanmeng",
                        "/d/zhongzhou/beimen", "/d/zhongzhou/chenglou",
                        "/d/zhongzhou/yanlingdong1", "/d/zhongzhou/inpomiao", }),
        "苏州城"   : ({ "/d/suzhou/xidajie2", "/d/suzhou/dongdajie2",
                        "/d/suzhou/road5", "/d/suzhou/road1",
                        "/d/suzhou/gumujiaohe", "/d/suzhou/zhenquting", }),
        "杭州城"   : ({ "/d/hangzhou/suti2", "/d/hangzhou/jujingyuan",
                        "/d/hangzhou/liuzhuang", "/d/hangzhou/road19",
                        "/d/hangzhou/huangniling", "/d/hangzhou/qinglindong", }),
        "襄阳城"   : ({ "/d/xiangyang/westjie2", "/d/xiangyang/southjie2",
                        "/d/xiangyang/xiaorong1", "/d/xiangyang/zhonglie",
                        "/d/xiangyang/guangchang", "/d/xiangyang/dingzi", }),
        "扬州城"   : ({ "/d/city/beimen", "/d/city/nanmen",
                        "/d/city/ximen", "/d/city/dongmen", }),
        "昆明城"   : ({ "/d/kunming/nandajie2", "/d/kunming/yunnan1",
                        "/d/kunming/xiaoximen", "/d/kunming/xiaolu", }),
        "荆州城"   : ({ "/d/jingzhou/guangchang", "/d/jingzhou/jznanmen",
                        "/d/jingzhou/wenquan", "/d/jingzhou/zizhulin", }),
        "兰州城"   : ({ "/d/lanzhou/guangchang", "/d/lanzhou/nroad1",
                        "/d/lanzhou/nanmen", "/d/lanzhou/ximen", }),
        "成都城"   : ({ "/d/city3/southroad1", "/d/city3/qingyanggong",
                        "/d/city3/northroad2", "/d/city3/fuheqiaoe", }),
        "福州城"   : ({ "/d/fuzhou/ximendajie", "/d/fuzhou/dongxiaojie",
                        "/d/fuzhou/nanmen", "/d/fuzhou/pingshan", }),
        "灵州城"   : ({ "/d/lingzhou/xidajie", "/d/lingzhou/nanmen",
                        "/d/lingzhou/dongdajie", }),
        "武功镇"   : ({ "/d/quanzhen/xijie", "/d/quanzhen/nanjie", }),
        "泉州城"   : ({ "/d/quanzhou/zhongxin", }),
        "华山附近" : ({ "/d/huashan/pingxinshi", "/d/village/square",
                        "/d/village/wexit", }),
        "凌霄城附近" : ({ "/d/lingxiao/sroad5", "/d/lingxiao/bar", }),
        "五毒教附近" : ({ "/d/wudu/cun3", "/d/wudu/jiang2",
                          "/d/wudu/bianzhai1", "/d/wudu/milin4", }),
        "佛山一带" : ({ "/d/foshan/street1", "/d/foshan/southgate", }),
        "南海一带" : ({ "/d/xiakedao/xkroad4" }),
        "汝州一带" : ({ "/d/shaolin/ruzhou" }),
        "嵩山一带" : ({ "/d/songshan/tianzhongge", "/d/shaolin/shijie1",
                        "/d/shaolin/shijie8", }),
        "终南山"   : ({ "/d/quanzhen/shanlu1", "/d/quanzhen/shijie1",
                        "/d/quanzhen/shijie9", "/d/quanzhen/cuipinggu",
                        "/d/quanzhen/baishulin3", "/d/gumu/taiyi1",
                        "/d/gumu/shenheyuan", "/d/quanzhen/banshanting", }),
        "星宿海"   : ({ "/d/xingxiu/tianroad2", }),
        "天山"     : ({ "/d/lingjiu/yan", }),
        "关外"     : ({ "/d/guanwai/baihe", "/d/guanwai/road8",
                        "/d/guanwai/xuedi1", "/d/guanwai/beicheng",
                        "/d/guanwai/shanshenmiao" }),
        "西域"     : ({ "/d/xingxiu/shamo5", "/d/baituo/gebi",
                        "/d/xueshan/shenghu", "/d/xueshan/hubian4",
                        "/d/xuedao/sroad3", "/d/xuedao/nroad6",
                        "/d/mingjiao/gebitan5", "/d/xingxiu/nanjiang2" }),
        "大理一带" : ({ "/d/dali/northgate", "/d/dali/southgate",
                        "/d/dali/shanlu2", "/d/dali/buxiongbu",
                        "/d/dali/jinzhihe", "/d/dali/xiaodao1",
                        "/d/dali/tianweijing", "/d/dali/wuding",
                        "/d/dali/luwang", "/d/dali/gudao",
                        "/d/dali/biluoxueshan", "/d/dali/zhenxiong",
                        "/d/dali/yixibu", "/d/dali/cangshanzhong",
                        "/d/dali/wumeng", "/d/dali/hongsheng", }),
]);


/*mapping levels = ([
//      combat_exp   skill_level
//      保证五十万以前任务容易完成，八十万之前简单完成。
        50000      : 20,                // level 1
        100000     : 30,                // level 2
        200000     : 40,                // level 3
        400000     : 50,                // level 4
        500000     : 120,               // level 5
        800000     : 150,               // level 6
        1200000    : 175,               // level 7
        1600000    : 200,               // level 8
        2000000    : 225,               // level 9
        2500000    : 250,               // level 10
        3000000    : 275,               // level 11
        4000000    : 300,               // level 12
        5500000    : 350,               // level 13
        7500000    : 400,               // level 14
        9000000    : 450,               // level 15
        15000000   : 500,               // level 16
]);
*/
//新增高级别npc by 薪有所属
mapping levels = ([
//      combat_exp   skill_level
        50000      : 20,                // level 1
        100000     : 30,                // level 2
        200000     : 40,                // level 3
        400000     : 50,                // level 4
        500000     : 120,               // level 5
        800000     : 150,               // level 6
        1200000    : 175,               // level 7
        1600000    : 200,               // level 8
        2000000    : 225,               // level 9
        2500000    : 250,               // level 10
        3000000    : 275,               // level 11
        4000000    : 300,               // level 12
        5500000    : 350,               // level 13
        7500000    : 400,               // level 14
        9000000    : 450,               // level 15
        15000000   : 500,               // level 16
        
        //新增10个级别，如果杀不动就不要想转世了
        //另外杀不动也可去转做task和杀外敌等手动或其它非杀敌任务。
        //by 薪有所属
        20000000   : 550,               // level 17
        28000000   : 600,               // level 18
        35000000   : 650,               // level 19
        42000000   : 700,               // level 20
        52000000   : 750,               // level 21
        62000000   : 800,               // level 22
        73000000   : 850,               // level 23
        86000000   : 900,               // level 24
        100000000  : 950,               // level 25
        120000000  : 1000,               // level 26
]);

// return the character(ob) 's level, 0 is lowest 
int check_level(object ob)
{
        int *exp;
        int i;

        exp = sort_array(keys(levels), 1);
        for (i = 0; i < sizeof(exp); i++)
                if (ob->query("combat_exp") < exp[i]) break;

        return i;
}

// return the character(ob) 's exp, by 大曾
int get_exp(object ob)
{
        int exp;

        exp = ob->query("combat_exp");

        return exp;
}

// set the the level of the npc's skill 修改 by 大曾
void init_npc_skill(object ob, int exp)
{
        int sk_lvl;
        string *ks;
        int i;
        
        ob->set("combat_exp", exp);
		
		if (exp < 500000)
			sk_lvl = to_int(pow(to_float(exp*10), 1.0 / 3)) * 0.4;
		else if (exp < 800000)
            sk_lvl = to_int(pow(to_float(exp*10), 1.0 / 3)) * (0.50 + to_float(exp * 3 ) / 8000000);
		else if (exp < 20000000)
			sk_lvl = to_int(pow(to_float(exp*10), 1.0 / 3)) * 0.8;
	    else
			sk_lvl = to_int(pow(to_float(exp*10), 1.0 / 3)) * 0.9;
		
		ob->set("magic_points", sk_lvl * 20);
		if (sk_lvl >= 350)
			ob->set("breakup", 1);
		if (sk_lvl >= 500)
			ob->set("animaout", 1);
        if (! ob->query_skills())
                return;
        ks = keys(ob->query_skills());
        for (i = 0; i < sizeof(ks); i++)
                ob->set_skill(ks[i], sk_lvl);

        return;
}

string *nations = ({ "中国", "日本", "龟慈", "荷兰", "天竺", "蒙古",
                     "俄罗斯", "英吉利", "法兰西", "西班牙", "葡萄牙",
                     "比利时", "塔吉克斯坦", "哈沙克斯坦", "乌兹别克斯坦" });

// generate a npc with nation & skill level
object create_npc(string nation, int lvl)
{
        object ob;

        switch (nation)
        {
        case "中国":
                ob = new(CLASS_D("generate") + "/chinese");
                NPC_D->generate_cn_name(ob);
                break;
        case "日本":
                ob = new(CLASS_D("generate") + "/japanese");
                NPC_D->generate_jp_name(ob);
                break;
        case "英吉利":
                ob = new(CLASS_D("generate") + "/english");
                NPC_D->generate_e_name(ob);
                break;
        case "法兰西":
        case "西班牙":
        case "葡萄牙":
        case "比利时":
        case "荷兰":
                ob = new(CLASS_D("generate") + "/european");
                NPC_D->generate_e_name(ob);
                break;
        case "天竺":
                ob = new(CLASS_D("generate") + "/indian");
                NPC_D->generate_in_name(ob);
                break;
        case "花剌子模":
        case "龟慈":
        case "俄罗斯":
        case "塔吉克斯坦":
        case "哈沙克斯坦":
        case "乌兹别克斯坦":
        case "蒙古":
                return 0;
        }

        ob->set("nation", nation);
        init_npc_skill(ob, lvl);

        return ob;
}

// generate challenger
object create_challenger()
{
        string *n;
        object *ob;
        int max_level;
        int i;
        int lvl;

        ob = all_interactive();
        max_level = 0;
        for (i = 0; i < sizeof(ob); i++)
                if (! wizardp(ob[i]) && max_level < check_level(ob[i]))
                        max_level = check_level(ob[i]);

        max_level++;
        lvl = 1 + random(max_level);
        if (lvl < 3) lvl = max_level;

        n = ({ "日本", "日本", "日本",
               "天竺",
               "英吉利", "法兰西", "西班牙", "葡萄牙", "比利时", "荷兰", });
        return create_npc(n[random(sizeof(n))], lvl);
}

// 完全独立的NPC属性系统 by 大曾
void set_from_me(object tob, object fob, int scale)
{
        mapping my, hp_status;
		int i;
        int points;
        int tmpstr, tmpint, tmpcon, tmpdex;	
		tmpstr = tmpint = tmpcon = tmpdex = 10;

        hp_status = fob->query_entire_dbase();
        my = tob->query_entire_dbase();

        if (! scale)
        {
                if (undefinedp(my["scale"]))
                        my["scale"] = 100;
                scale = my["scale"];
        }
        points = 80 - (tmpstr + tmpint + tmpcon + tmpdex);//NPC没有先天丹吃
        for (i = 0; i < points; i++) {
                switch (random(4)) {
                case 0: if (tmpstr < 30) tmpstr++; else i--; break;
                case 1: if (tmpint < 30) tmpint++; else i--; break;
                case 2: if (tmpcon < 30) tmpcon++; else i--; break;
                case 3: if (tmpdex < 30) tmpdex++; else i--; break;
                }
        }
        my["str"] = tmpstr;
        my["con"] = tmpcon;
        my["dex"] = tmpdex;
        my["int"] = tmpint;
		my["per"] = 5 + random(25);
		
		my["max_qi"]     = hp_status["max_qi"]   * scale / 100;
        my["eff_qi"]     = my["max_qi"];
        my["qi"]         = my["max_qi"];
        my["max_jing"]   = hp_status["max_jing"] * scale / 100;
        my["eff_jing"]   = my["max_jing"];
        my["jing"]       = my["max_jing"];
        my["max_neili"]  = hp_status["max_neili"]* scale / 130;//适当减少NPC的最大内力，约为理论最大内力的77%，毕竟玩家很难保证内力吃满
        my["jiali"]      = tob->query_skill("force") / 4;//适当减少NPC加力3->4
		//取消NPC最大内力上限9000的设定
        /*if (my["max_neili"] > 9000)
                // max_neili not more then 9k
                my["max_neili"] = 9000;*/
        my["neili"]      = my["max_neili"];//取消NPC内力为2倍最大内力的设定
		
        tob->set_from_me(fob, scale);
}

// select a random 

string random_place(string *not_place)
{
        string *kp;

        kp = keys(place);

        // exclude some place
        if (arrayp(not_place))
                kp -= not_place;

        // select a random place
        return kp[random(sizeof(kp))];
}

// place npc
void place_npc(object ob, string *not_place, string *in_place)
{
        string *kp;
        string p;
        string startroom;
        //object pos;

        // select the place
        if (! arrayp(in_place))
                kp = keys(place);
        else
                kp = in_place;

        // exclude some place
        if (arrayp(not_place))
                kp -= not_place;

        // select the exact position
/*
        for (;;)
        {
                p = kp[random(sizeof(kp))];
                startroom = place[p][random(sizeof(place[p]))];
                pos = get_object(startroom);


                if (! objectp(pos = get_object(startroom)))
                {
                        log_file("log", sprintf("error to place npc to %s:%s\n",
                                                p, startroom));
                        continue;
                }
                break;

        }
*/

        p = kp[random(sizeof(kp))];
        startroom = place[p][random(sizeof(place[p]))];

        // move to the position
        //ob->move(pos);

        ob->move(startroom);
        ob->set("place", p);
        ob->set("startroom", startroom);
        ob->set_temp("moved", ({ }));
        message_vision("$N走了过来。\n", ob);

        return;
}

#define MAX_MOVED       5

// random move
void random_move(object ob)
{
        mapping exits;
        string *moved;
        string dir;
        string *dirs;
        int i;

        moved = ob->query_temp("moved");
        if (! moved) moved = ({ });
        if (sizeof(moved) >= MAX_MOVED)
        {
                // out of range, move back
                dir = GO_CMD->query_reverse(moved[sizeof(moved) - 1]);
        } else
        {
                exits = environment(ob)->query("exits");
                dirs = keys(exits);
                for (i = 0; i < 12; i++)
                {
                        if (! sizeof(dirs))
                                return;
                        dir = dirs[random(sizeof(dirs))];
                        if (stringp(GO_CMD->query_reverse(dir)) &&
                            ! exits[dir]->query("no_fight"))
                                break;
                        dirs -= ({ dir });
                }
        }

        if (sizeof(moved) &&
            GO_CMD->query_reverse(dir) == moved[sizeof(moved) - 1])
        {
                // move back
                moved = moved[0..<2];
        } else
                moved += ({ dir });
        ob->set_temp("moved", moved);

        GO_CMD->main(ob, dir);
}

// get all ultra master
object *query_ultra_master()
{
        return ({ get_object(HUANG_SHANG),
                  get_object(DUGU_QIUBAI),
                  get_object(KUIHUA_TAIJIAN),
                  get_object(HUO_SHAN) });
}


