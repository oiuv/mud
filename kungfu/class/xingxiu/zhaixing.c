// zhaixing.c 摘星子
// modify by rcwiz 2003

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#include "xingxiu.h"
#include <ansi.h>

string ask_me();
string ask_book();

void create()
{
        set_name("摘星子", ({ "zhaixing zi", "zhaixing", "zi" }));
        set("nickname", HIR "星宿派大师兄" NOR);
        set("long", 
                "他就是丁春秋的大弟子、星宿派大师兄摘星子。\n"
                "他三十多岁，脸庞瘦削，眼光中透出一丝乖戾之气。\n");
        set("gender", "男性");
        set("age", 35);
        set("attitude", "peaceful");
        set("class", "fighter");
        set("str", 26);
        set("int", 28);
        set("con", 26);
        set("dex", 26);
        
        set("max_qi", 3400);
        set("max_jing", 1800);
        set("neili", 5800);
        set("max_neili", 5800);
        set("jiali", 80);
        set("combat_exp", 420000);
        set("shen_type", -1);

        set_skill("force", 140);
        set_skill("huagong-dafa", 140);
        set_skill("guixi-gong", 140);
        set_skill("throwing", 120);
        set_skill("feixing-shu", 120);
        set_skill("dodge", 120);
        set_skill("zhaixing-gong", 120);
        set_skill("whip", 120);
        set_skill("chanhun-suo", 120);
        set_skill("strike", 120);
        set_skill("chousui-zhang", 120);
        set_skill("claw", 120);
        set_skill("sanyin-wugongzhao", 120);
        set_skill("parry", 120);
        set_skill("staff", 120);
        set_skill("tianshan-zhang", 120);
        set_skill("poison", 140);
        set_skill("medical", 120);
        set_skill("xingxiu-qishu", 140);

        set("no_teach", ([
                "huagong-dafa" : "化功大法要老仙亲自传授。",
        ]));

        map_skill("force", "huagong-dafa");
        map_skill("dodge", "zhaixing-gong");
        map_skill("strike", "chousui-zhang");
        map_skill("claw", "sanyin-wugongzhao");
        map_skill("parry", "chousui-zhang");
        map_skill("throwing", "feixing-shu");
        map_skill("whip", "chanhun-suo");
        map_skill("staff", "tianshan-zhang");

        prepare_skill("strike", "chousui-zhang");
        prepare_skill("claw", "sanyin-wugongzhao");

        set("coagents", ({
                ([ "startroom" : "/d/xingxiu/riyuedong",
                   "id"        : "ding chunqiu", ]),
        }));

        set("inquiry", ([
                "炼心弹"    : (: ask_me :),
                "秘籍"      : (: ask_book :),
                "天山器法"  : (: ask_book :),
        ]));
        set("dan_count", 1);
        set("book_count", 1);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "claw.zhua" :),
                (: perform_action, "strike.tao" :),
                (: perform_action, "strike.shi" :),
                (: perform_action, "strike.dan" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );

        set_temp("apply/attack", 150);
        set_temp("apply/defense", 150);
        set_temp("apply/damage", 150);
        set_temp("apply/unarmed_damage", 150);

        create_family("星宿派", 2, "弟子");

        setup();
        carry_object("/clone/weapon/lianzi")->wield();
}

void attempt_apprentice(object ob)
{
        if (ob->query("shen") > 0)
        {
             command("heng");
             command("say 老仙最讨厌你们这些正道中人，你还是回去吧！");
             return;
        }
        command("say 好吧，我就收下你了。");
        welcome(ob);
        command("recruit " + ob->query("id"));
}

string ask_me()
{
        mapping fam; 
        object ob;
        
        if (!(fam = this_player()->query("family")) || fam["family_name"] != "星宿派")
                return RANK_D->query_respect(this_player()) + "与本派素无来往，不知此话从何谈起？\n";

        if (query("dan_count") < 1)
                return "你来晚了，没有炼心弹了。\n";

        add("dan_count", -1);
        ob = new("/d/xingxiu/obj/lianxindan");
        ob->move(this_player());
        return "这些练心弹够你用的了吧。\n";
}

string ask_book()
{
        mapping fam; 
        object ob;
        
        if (!(fam = this_player()->query("family")) || fam["family_name"] != "星宿派")
                return RANK_D->query_respect(this_player()) + "与本派素无来往，不知此话从何谈起？\n";

        if (query("book_count") < 1)
                return "你来晚了，现在没什么剩的了。\n";

        add("book_count", -1);
        ob = new("/clone/book/throw_book");
        ob->move(this_player());
        return "好吧，这本书你拿回去好好看看吧。\n";
}

int accept_ask(object me, string topic)
{
        switch(topic)
        {      
             case "如蛆附骨":
                 return MASTER_D->teach_pfm(me, this_object(),
                               (["perform"  :  "can_perform/tianshan-zhang/fugu",
                                 "name"     :  "如蛆附骨",
                                 "sk1"      :  "tianshan-zhang",
                                 "lv1"      :  60,
                                 "shen"     :  -2200,
                                 "gongxian" :  80,
                                 "force"    :  80 ]));
                  break;

             case "冰雪纷飞":
                 return MASTER_D->teach_pfm(me, this_object(),
                               (["perform"  :  "can_perform/tianshan-zhang/xue",
                                 "name"     :  "冰雪纷飞",
                                 "sk1"      :  "tianshan-zhang",
                                 "lv1"      :  60,
                                 "shen"     :  -22000,
                                 "gongxian" :  80,
                                 "force"    :  80 ]));
                  break;

             case "满天花雨":
                 return MASTER_D->teach_pfm(me, this_object(),
                               (["perform"  :  "can_perform/feixing-shu/hua",
                                 "name"     :  "满天花雨",
                                 "sk1"      :  "feixing-shu",
                                 "lv1"      :  100,
                                 "sk2"      :  "force",
                                 "lv2"      :  120,
                                 "shen"     :  -5500,
                                 "gongxian" :  400 ]));
                  break;

             case "锁魂势":
                 return MASTER_D->teach_pfm(me, this_object(),
                               (["perform"  :  "can_perform/chanhun-suo/suo",
                                 "name"     :  "锁魂势",
                                 "sk1"      :  "chanhun-suo",
                                 "lv1"      :  70,
                                 "sk2"      :  "force",
                                 "lv2"      :  120,
                                 "shen"     :  -6500,
                                 "gongxian" :  400 ]));
                  break;

             case "三阴毒爪":
                 return MASTER_D->teach_pfm(me, this_object(),
                               (["perform"  :  "can_perform/sanyin-wugongzhao/zhua",
                                 "name"     :  "三阴毒爪",
                                 "sk1"      :  "sanyin-wugongzhao",
                                 "lv1"      :  100,
                                 "sk2"      :  "force",
                                 "lv2"      :  100,
                                 "shen"     :  -7000,
                                 "gongxian" :  500 ]));
                  break;

             case "腐尸毒":
                 return MASTER_D->teach_pfm(me, this_object(),
                               (["perform"  :  "can_perform/chousui-zhang/shi",
                                 "name"     :  "腐尸毒",
                                 "sk1"      :  "chousui-zhang",
                                 "lv1"      :  140,
                                 "sk2"      :  "force",
                                 "lv2"      :  120,
                                 "sk3"      :  "poison",
                                 "lv3"      :  150,
                                 "sk4"      :  "throwing",
                                 "lv4"      :  120,                                 
                                 "shen"     :  -10000,
                                 "neili"    :  1200,
                                 "gongxian" :  500 ]));
                  break;

             default : 
                  return 0;
                           
        }
}

void unconcious()
{
        die();
}

