// yuenv.c 越女

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

mixed teach_me();

void create()
{
        set_name("越女", ({ "yue nv", "yuenv" }));
        set("long", @LONG
她是一位年轻的牧羊女，脸上挂着一丝与年龄不相称的哀思。
LONG );
        set("gender", "女性");
        set("class", "swordsman");
        set("age", 18);
        set("attitude", "friendly");
        set("per", 29);
        set("str", 19);
        set("int", 35);
        set("con", 32);
        set("dex", 35);
        
        set("max_qi", 5000);
        set("max_jing", 2500);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 50);
        set("combat_exp", 2500000);

        set_skill("force", 250);
        set_skill("dodge", 270);
        set_skill("parry", 270);
        set_skill("sword", 270);
        set_skill("yunv-xinfa", 250);
        set_skill("yuenv-jian", 270);
        set_skill("feiyan-huixiang", 250);

        map_skill("dodge", "feiyan-huixiang");
        map_skill("force", "yunv-xinfa");
        map_skill("sword", "yuenv-jian");

        set("inquiry", ([
                "越女剑术" : (: teach_me : ),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: perform_action, "sword.xin" :),
        }));

        setup();
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/zhujian")->wield();
}

mixed teach_me()
{
        object me;

        me = this_player();

        if (me->query("gender") != "女性")
        {
                command("say 这剑法只适合女性修炼，你还是免了吧！");
                return 1;
        }

        if (me->query_skill("yuenv-jian", 1) >= 1)
        {
                command("say 你不是已经会了吗？还来找我干什么！");
                return 1;
        }

        if (me->query("dex") < 36)
        {
                command("shake");
                command("say 你先天身法不够，无法修炼越女剑术。");
                return 1;
        }

        if (me->query_skill("dodge") < 270)
        {
                command("say 你轻功火候不足，无法修炼越女剑术。");
                return 1;
        }

        command("say 恩，那好吧，我就教你越女剑术。");

        me->set_skill("yuenv-jian", 10);

        tell_object(me, HIG "你学会了越女剑术！\n" NOR);

        command("say 下去好好练习吧。");
  
        return 1;    
    
}

int accept_ask(object me, string topic)
{
     switch (topic)
     {
        case "西子捧心" :
                return MASTER_D->teach_pfm(me, this_object(),
                        ([ "perform" : "can_perform/yuenv-jian/xin",
                           "free"    : 1,
                           "name"    : "西子捧心",
                           "sk1"     : "yuenv-jian",
                           "lv1"     : 140,
                           "neili"   : 2800,
                        ]));
                break;

        default : 
                return 0;

      }
        
}

void unconcious()
{
        die();
}
