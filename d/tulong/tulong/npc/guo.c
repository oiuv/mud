#include <ansi.h>

inherit NPC;

void create()
{
        set_name("过三拳", ({ "guo sanquan", "guo", "sanquan"}) );
        set("long",
                  "这是神拳门掌门人过三拳。身材高大，双\n臂肌肉结实，一看就知道是外家好手。\n");
        set("attitude", "heroism");
        set("title", HIR "神拳门掌门人" NOR);
        set("age", 56);
        set("combat_exp", 800000);

        set_skill("unarmed", 100+random(50));
        set_skill("parry", 100+random(50));
        set_skill("dodge", 100+random(50));
        set_skill("force", 100+random(50));

        set("max_qi", 1000+random(500)); 
        set("max_jing", 1000+random(500)); 


        setup();

        carry_object("/d/beijing/npc/obj/cloth6")->wear();
}

int accept_fight(object who)
{
        command("say 我不和你蛮打，只和你比(bi)一些拳脚上的功夫。");
        return 0;
}

int accept_hit(object who)
{
        command("say 我不和你蛮打，只和你比(bi)一些拳脚上的功夫。");
        return 0;
}

int accept_kill(object who)
{
        command("say 怎么，想得屠龙刀就非得要行凶不成？");
	return 1;
}

int accept_ansuan(object who)
{
        return notify_fail("你刚想暗算，可是只见会场里黑压压的挤满了人，根本看不清楚。\n");
}

int begin(object me)
{
        command("bow");
        command("say 阁下对不住了，今日我如不趁人之危，定会死于阁下之手！");
        command("say 我神拳门绝技，乃是使用手上功夫，先吃我三拳再说。");

        message_vision(HIR "\n$N喝道：小心了！我这第一拳乃“催筋断骨”！\n" NOR,
                           this_object());
        COMBAT_D->do_attack(this_object(), this_player(),query_temp("weapon"));

        message_vision(HIR "\n$N喝道：好！看我第二拳“崩山裂石”！\n" NOR,
                           this_object());
        COMBAT_D->do_attack(this_object(), this_player(),query_temp("weapon"));

        message_vision(HIR "\n$N喝道：第三拳来了！这式叫做“横扫千军，直摧万马”！\n" NOR,
                           this_object());
        this_object()->set_temp("apply/attack",250);
        this_object()->set_temp("apply/damage",250);
        COMBAT_D->do_attack(this_object(), this_player(),query_temp("weapon"));
        set("anti",me);
        me->set_temp("bi",1);
        if (me->query("max_neili")>2000) die();
        return 1;
}

void die()
{
        if (objectp(query("anti")))
        {
                message_vision(HIR "\n\n$N一拳端端正正的击中了$n" HIR
                                   "的小腹。\n" NOR,
                                   this_object(),query("anti"));

                message_vision(HIR "人身的小腹本来极是柔软，但$N" HIR
                                   "着拳时如中铁石，刚知不妙，已狂喷鲜血。\n" NOR,
                                   this_object(),query("anti"));

                query("anti")->set_temp("win_guo",1);
                query("anti")->delete_temp("bi");
        }
::die();
}

void init()
{
        add_action("do_get","get");
        add_action("do_bi","bi");
}

int do_get(string arg)
{
        object obj;
        string what,where;
        if(!arg) return 0;
        if (objectp(obj=present("mai jing",environment()))) return 0;
        if(sscanf(arg,"%s from %s",what, where) !=2) return 0;
        obj=this_object();
        if(where == "ding")
        {
                message_vision(CYN "$N哼了一声。\n" NOR,
                                   obj);
                message_vision(CYN "$N说道：要想得到宝刀，先过我三拳！\n" NOR,
                                   obj);
                this_player()->delete_temp("bi");
                return 1;
        }
        return 0;
}

int do_bi()
{
        object me=this_player();
        if (objectp(present("mai jing",environment()))) return 0;
        begin(me);
        return 1;
}

