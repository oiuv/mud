//zhangwuji.c
// by rcwiz 2003 for yhonline

#include <ansi.h>
#include "mingjiao.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

void create()
{
    
    set_name("张无忌", ({ "zhang wuji", "zhang", "wuji" }));

    set("long", @LONG
明教教主张无忌，统领天下十万教众，豪气干云，叱咤千秋，
「九阳神功」、「乾坤大挪移」独步天下，是江湖中不世出的
少年英雄。
LONG );

    set("title", HIR "明教教主" NOR);
    set("gender", "男性");
    set("age", 24);
    set("shen_type", 1);
    set("attitude", "friendly");
    set("class", "fighter");

    set("str", 33);
    set("int", 35);
    set("con", 38);
    set("dex", 33);

    set("qi", 8800);
    set("max_qi", 8800);
    set("jing", 3700);
    set("max_jing", 3700);
    set("neili", 12000);
    set("max_neili", 12000);
    set("jiali", 200);

    set("combat_exp", 5000000);
    set("score", 455000);
    
    set_skill("force", 360);
    set_skill("unarmed", 340);
    set_skill("dodge", 340);
    set_skill("parry", 340);
    set_skill("cuff", 340);
    set_skill("sword", 340);
    set_skill("jiuyang-shengong", 360);
    set_skill("shenghuo-shengong", 360);
    set_skill("shenghuo-xinfa", 360);
    set_skill("qiankun-danuoyi", 360);
    set_skill("shenghuo-bu", 340);
    set_skill("qishang-quan", 340);
    set_skill("taiji-quan", 340);
    set_skill("taiji-jian", 340);
    set_skill("shenghuo-ling", 340);

    map_skill("force", "shenghuo-shengong");
    map_skill("dodge", "qiankun-danuoyi");
    map_skill("unarmed", "jiuyang-shengong");
    map_skill("cuff", "qishang-quan");
    map_skill("sword", "shenghuo-ling");
    map_skill("parry", "qiankun-danuoyi");

    create_family("明教", 36, "教主");

    prepare_skill("cuff", "qishang-quan");

    set("no_teach", ([
	  "jiuyang-shengong"  : "这个我可不能传你。",
	  "taiji-jian"        : "你还是找我太师父吧！",
	  "taiji-quan"        : "你还是找我太师父吧！",
	  "qishang-quan"      : "想学七伤拳你还是找我义父谢逊吧！",
	  	//张无忌传授乾坤大挪移，只是给乾坤大挪移一个明教出身，其实没什么用。
	  //"qiankun-danuoyi"   : "乾坤大挪移只有明教教主方能修炼，难道你想做教主？",
    ]));

    set("chat_chance_combat", 120); 
    set("chat_msg_combat", ({
	(: command("perform sword.hua") :),
	(: command("perform sword.xi") :),
	(: command("perform sword.lian") :),
	(: command("perform sword.can") :),
	(: command("perform cuff.shang") :),
	(: command("perform cuff.fei") :),
	(: command("yun shield") :),
	(: command("yun powerup") :),
	(: command("yun recover") :),
    }) );

    set("inquiry",([
          "明教" :     "你打听我们明教做什么？。\n",
          "金毛狮王" : "那是我义父谢大侠的职司。\n",
          "谢逊" :     "他就是我义父的大号。\n",
          "张翠山" :   "你想找我父亲有事麽? \n",
          "殷素素" :   "我娘是明尊座下紫微堂主。\n",
          "张三丰" :   "我太师父近来可好? \n",
          "赵敏" :     "人生失一知己, 生亦何欢, 死亦何忧, 敏儿, 你在哪里?\n",
          "小昭" :     "小昭我可一直念着她的好处。\n",
          "周芷若" :   "找她就去峨嵋山, 别来烦我。\n",
    ]));


    set_temp("apply/attack", 180);
    set_temp("apply/damage", 180);
    set_temp("apply/unarmed_damage", 180);
    set_temp("apply/armor", 180);

    setup();
    carry_object("/d/mingjiao/obj/baipao")->wear();
    carry_object("/clone/weapon/gangjian")->wield();

}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 90000)
        {
                command("say 你行侠仗义的事做得还不够，还是请回吧。");
                return;
        }
      
        if (ob->query_skill("shenghuo-xinfa", 1) < 180)
        {       
                command("say 你圣火心法不够娴熟，还是下去多练习一下吧！");
                return ;
        }

        if (ob->query_skill("force", 1) < 180)
        {       
                command("say 你基本内功火候不够，怎么学我明教的圣火神功！");
                return ;
        }
     
        if (ob->query("combat_exp") < 800000)
        {
                command("say 你江湖经验还不够，下去多磨练一下吧！");
                return ;
        }

        command("nod");
        command("say 好，好，今日我就收你为弟子，将我明教圣火神功传授于你");
        command("recruit " + ob->query("id"));
}

int accept_ask(object me, string topic)
{
        switch (topic)
        {

        case "历练" :
        case "历炼" :
        case "锻炼" :
                return QUEST_D->accept_ask(this_object(), me, topic);
                break;


        case "吸焰令" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/shenghuo-ling/xi",
                           "name"    : "吸焰令",
                           "sk1"     : "shenghuo-ling",
                           "lv1"     : 140,
                           "neili"   : 2000,
                           "gongxian": 800,
                           "shen"    : 100000, ]));
                break;

        case "敛心令" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/shenghuo-ling/lian",
                           "name"    : "敛心令",
                           "sk1"     : "shenghuo-ling",
                           "lv1"     : 160,
                           "neili"   : 2200,
                           "gongxian": 800,
                           "shen"    : 100000, ]));
                break;

        case "光华令" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/shenghuo-ling/hua",
                           "name"    : "光华令",
                           "sk1"     : "shenghuo-ling",
                           "lv1"     : 160,
                           "neili"   : 2400,
                           "gongxian": 900,
                           "shen"    : 80000, ]));
                break;

        case "残血令" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/shenghuo-ling/can",
                           "name"    : "残血令",
                           "sk1"     : "shenghuo-ling",
                           "lv1"     : 220,
                           "neili"   : 5000,
                           "force"   : 350,
                           "gongxian": 1000,
                           "shen"    : 100000, ]));
                break;

        case "混沌一阳" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/jiuyang-shengong/hun",
                           "free"    : 1,
                           "name"    : "混沌一阳",
                           "sk1"     : "jiuyang-shengong",
                           "lv1"     : 180,
                           "neili"   : 2000,
                           "force"   : 270,
                        ]));
                break;

        case "九曦混阳" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/jiuyang-shengong/jiu",
                           "free"    : 1,
                           "name"    : "九曦混阳",
                           "sk1"     : "jiuyang-shengong",
                           "lv1"     : 200,
                           "neili"   : 5000,
                           "force"   : 320,
                         ]));
                break;

        case "金阳破岭" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/jiuyang-shengong/po",
                           "free"    : 1,
                           "name"    : "金阳破岭",
                           "sk1"     : "jiuyang-shengong",
                           "lv1"     : 220,
                           "sk2"     : "sword",
                           "lv2"     : 240,
                           "sk3"     : "force",
                           "lv3"     : 240,
                           "neili"   : 5500,
                        ]));
                break;

        case "骄阳劈天" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/jiuyang-shengong/pi",
                           "free"    : 1,
                           "name"    : "骄阳劈天",
                           "sk1"     : "jiuyang-shengong",
                           "lv1"     : 220,
                           "sk2"     : "blade",
                           "lv2"     : 240,
                           "sk3"     : "force",
                           "lv3"     : 240,
                           "neili"   : 5500,
                        ]));
                break;

        case "魔光日无极" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/jiuyang-shengong/ri",
                           "free"    : 1,
                           "name"    : "魔光日无极",
                           "sk1"     : "jiuyang-shengong",
                           "lv1"     : 260,
                           "neili"   : 8000,
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



