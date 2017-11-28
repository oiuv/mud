// yang.c 杨过

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#include <ansi.h>
#include "gumu.h"

string ask_yunv();
int not_to_learn_ss(object ob);
mixed teach_sad();

void create()
{
        set_name("杨过", ({"yang guo", "yang"}));
        set("gender", "男性");
        set("age", 26);
        set("long", @LONG
他看上去眉目之间有一股清秀之气，然而隐隐约约却让人感到一阵哀伤之情，
左袖空荡荡的，显然已是残疾。
LONG );
        set("attitude", "friendly");

        set("str", 35);
        set("int", 36);
        set("con", 34);
        set("dex", 32);

        set("qi", 7800);
        set("max_qi", 7800);
        set("jing", 6900);
        set("max_jing", 6900);
        set("neili", 8500);
        set("max_neili", 8500);
        set("jiali", 120);

        set("combat_exp", 5750000);

        set("couple/id", "xiao longnv");
        set("couple/name", "小龙女");

        set_skill("force", 390);
        //set_skill("yunv-xinfa", 390);
        set_skill("yunv-xinjing", 390);
        set_skill("surge-force", 390);
        set_skill("sword", 380);
        set_skill("yunv-jian", 380);
        set_skill("quanzhen-jian", 380);
	      set_skill("xuantie-jian", 380);
        set_skill("dodge", 350);
        set_skill("yunv-shenfa", 350);
        set_skill("parry", 385);
        set_skill("unarmed", 385);
        set_skill("meinv-quan", 370);
        set_skill("strike", 380);
        set_skill("sad-strike", 380);
        set_skill("fireice-strike", 380);
        set_skill("tianluo-diwang", 360);
        set_skill("literate", 250);
        set_skill("taoism", 300);
	set_skill("medical", 380);
	//set_skill("yunv-xinjing", 380);
        set_skill("throwing", 340);
        set_skill("yufeng-zhen", 340);
        set_skill("martial-cognize", 300);

        map_skill("force", "surge-force");
        map_skill("sword", "xuantie-jian");
        map_skill("dodge", "yunv-shenfa");
        map_skill("parry", "meinv-quan");
        map_skill("unarmed", "sad-strike");
        map_skill("strike", "tianluo-diwang");

        prepare_skill("unarmed", "sad-strike");

        create_family("古墓派", 3, "弟子");

        set("inquiry", ([
                "王重阳" : "嘿...嘿！",
	        "郭靖"   : "他可真是真正的大侠。",
		"黄蓉"   : "黄师叔么...真不好说啊。",
		"小龙女" : "你打听我妻子干什么？",
		"杨康"   : "算了，不提他也罢。",
                "玉蜂针" : "我手头可没有，很久没有用它了。",
                "黯然销魂掌" : (: teach_sad :),
                "玄铁剑法"   : "那是独孤前辈所创绝学，在下有幸倒是习得！\n",
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
	        (: perform_action, "strike.wang" :),
	        (: perform_action, "unarmed.xiao" :),
	        (: perform_action, "unarmed.tuo" :),
	        (: exert_function, "recover" :),
	        (: exert_function, "powerup" :),
        }));

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();

        carry_object("/clone/cloth/qingyi")->wear();
}

//新增杨过收徒 by 薪有所属
void attempt_apprentice(object ob)
{

        if (! permit_recruit(ob) )
                return;
                
        if (ob->query_str() < 45)
        {
                command("say 连玄铁剑都拿不动，怎么做我徒弟。");
                return;
        }

        if ((int)ob->query_skill("yunv-xinjing", 1) < 120 ) {
                command("say 你还是先跟龙儿学点玉女心经吧。");
                return;
        }
        
        if ((int)ob->query("max_neili") < 2000)
        {
                command("say 你把内力锻炼好了再来也不迟啊！");
                return;
        }

        command("say 好吧，看你资质尚可，我就收下你这个徒弟了。");
        command("recruit " + ob->query("id"));
}

mixed teach_sad()
{
        object ob = this_player();

        if (ob->query_skill("sad-strike", 1) >= 1)
        {
                command("say 你不是已经会了吗？");
                return 1;
        }

        if (ob->query("gender") != "男性")
        {
                command("say 我这门武功只适合男性修炼，你还是算了吧！");
                return 1;
        }

        if (ob->query("static/sadly") < 3)
        {
                command("say 你体会不到那种思念妻子的情怀，"
                        "无法领会我的黯然销魂掌！");
                return 1;
        }

        if (ob->query("character") == "阴险奸诈" || 
            ob->query("character") == "心狠手辣")
        {
                command("say 你一心想着去害人，无法领悟黯然销魂的境界！");
                return 1;
        }

        if (ob->query("int") < 34)
        {
                command("say 你先天悟性不足，无法领悟黯然销魂掌。");
                return 1;
        }

        if (ob->query("str") < 34)
        {
                command("say 你先天臂力不足，无法修炼黯然销魂掌。");
                return 1;
        }

        if ((int)ob->query("max_neili") < 3000)
        {
                command("say 你的内力修为不足，无法练黯然销魂掌。");
                return 1;
        }

        if (ob->query_skill("force") < 320)
        {
                command("say 你内功修为不足，无法修炼黯然销魂掌。");
                return 1;
        }                

        if ((int)ob->query_skill("unarmed", 1) < 200)
        {
                command("say 你的基本拳脚不够娴熟，无法练黯然销魂掌。");
                return 1;

        }

        if (ob->query_skill("martial-cognize", 1) < 200)
        {
                command("say 你武学修养不足，无法领悟炼黯然销魂掌。");

                return 1;
        }

        message_vision(HIW "$n" HIW "看了看$N" HIW "，道：好！你我也算是颇有"
                       "渊源，我就传你黯然销魂掌！\n" NOR, ob, this_object());

        ob->set_skill("sad-strike", 10);

        tell_object(ob, HIG "你学会了「黯然销魂掌」。\n" NOR);
 
        command("tan");
        command("say 下去练习吧，记得要好好对待你的妻子！");

        return 1;
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {

        case "卷字诀" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/xuantie-jian/juan",
                           "free"    : 1,
                           "name"    : "卷字诀",
                           "sk1"     : "xuantie-jian",
                           "lv1"     : 100,
                           "neili"   : 3000,
                           "force"   : 400,
                        ]));
                break;

        case "大江东去" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/xuantie-jian/dong",
                           "free"    : 1,
                           "name"    : "大江东去",
                           "sk1"     : "xuantie-jian",
                           "lv1"     : 200,
                           "neili"   : 5000,
                           "force"   : 400,
                         ]));
                break;

        case "黯然销魂" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/sad-strike/xiao",
                           "free"    : 1,
                           "name"    : "黯然销魂",
                           "sk1"     : "sad-strike",
                           "lv1"     : 150,
                           "neili"   : 3200,
                           "force"   : 320,
                         ]));
                break;

        case "拖泥带水" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/sad-strike/tuo",
                           "free"    : 1,
                           "name"    : "拖泥带水",
                           "sk1"     : "sad-strike",
                           "lv1"     : 180,
                           "neili"   : 4000,
                           "force"   : 360,
                         ]));
                break;

        default:
                return 0;
        }
}

void unconcious()
{
        die();
}
