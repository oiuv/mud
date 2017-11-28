#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("何太冲", ({ "he taichong", "he", "taichong" }));
        set("long", "一个五十多岁的中年男子，眉头紧锁，原来\n"
                    "这就是昆仑派的掌门，人称“铁琴先生”的\n"
                    "何太冲，至六大门派围攻光明顶之后，被赵\n"
                    "用计擒拿，关押在这里。\n");
        set("title", "昆仑派第三代掌门");
        set("nickname", WHT "铁琴先生" NOR);
        set("gender", "男性");
        set("age", 58);
        set("attitude", "peaceful");
        set("shen_type", -1);

        set("per", 30);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        
        set("max_qi", 3500);
        set("max_jing", 1200);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 100);
        set("combat_exp", 1400000);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.fanyin" :),
                (: exert_function, "recover" :),
        }) );

        set_skill("literate", 100);
        set_skill("tanqin-jifa", 250);
        set_skill("qingxin-pushan", 250);
        set_skill("force", 220);
        set_skill("dodge", 220);
        set_skill("unarmed", 220);
        set_skill("parry", 220);
        set_skill("strike", 220);
        set_skill("sword", 220);
        set_skill("lingxu-bu", 220);
        set_skill("songshan-xinfa", 220);
        set_skill("kunlun-jian", 220);
        set_skill("cuixin-zhang", 220);

        map_skill("dodge", "lingxu-bu");
        map_skill("force", "songshan-xinfa");
        map_skill("strike", "cuixin-zhang");
        map_skill("parry", "kunlun-jian");
        map_skill("sword", "kunlun-jian");
        map_skill("tanqin-jifa", "qingxin-pushan");

        prepare_skill("strike", "cuixin-zhang");

        create_family("昆仑派", 3, "掌门");

        setup();
        carry_object("/clone/cloth/cloth")->wear();
        carry_object("/clone/weapon/zhujian")->wield(); 
}

void init()
{
        add_action("begin","bi");
}

int accept_fight(object who)
{
        command("say 哼，如我何太冲内力尚在，也由不得你猖狂。");
        return 0;
}

int accept_hit(object who)
{
        command("say 哼，如我何太冲内力尚在，也由不得你猖狂。");
        return 0;
}

int accept_kill(object who)
{
        command("heng");
        command("say 我何太冲被你们用诡计擒住，早就没想过要继续存活，要杀就动手吧。");
        return notify_fail("刹那间你只觉下不了手。\n");
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见楼上人影晃动，根本看不清楚。\n");
}

int begin()
{
        object weapon;
        object me=this_player();
        object obj=this_object();

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
        {
                command("say 我内力全失，现在只能和你比剑！");
                return notify_fail("看起来何太冲并不想跟你较量。\n");
        }

        command("heng");
        command("say 进招吧！");
        message_vision(HIY "$N话音未落，单手一抖，手中竹剑对准$n" HIY
                           "当胸斜斜刺出！正是昆仑嫡传的两仪剑法。\n" NOR,
                           obj, this_player());

        me->set_temp("bi",1);
        set("anti",me);
        obj->kill_ob(this_player());
        this_player()->kill_ob(obj);
        return 1;
}

void die()
{
        if (objectp(query("anti")))
        {
                message_vision(CYN "\n赵敏皱了皱眉头，低声骂道：“废物！”\n" NOR,
                                   this_object());

                query("anti")->set_temp("win_he",1);
                query("anti")->delete_temp("bi");
        }
::die();
}

