// donghai.c

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("东海三太子", ({ "prince of dragon", "dragon", "san taizi" }) );
        set("title", HIG "龙族" NOR);
        set("gender", "男性");
        set("age", 23);
        set("long", @LONG
这是一个神采奕奕的年轻人，风度翩翩，气宇轩昂。
LONG );
        set("combat_exp", 10000000);
        set("shen_type", 0);
        set("attitude", "heroism");
        set("max_neili", 20000);
        set("neili", 20000);
        set("max_jing", 20000);
        set("jing", 20000);
        set("max_qi", 25000);
        set("qi", 25000);
        set("jingli", 20000);
        set("max_jingli", 20000);

        set("str", 100);
        set("int", 30);
        set("con", 100);
        set("dex", 100);

        set_skill("unarmed", 1200);
        set_skill("sword", 1200);
        set_skill("parry", 1200);
        set_skill("dodge", 1200);
        set_skill("force", 1200);

        set("jiali", 200);

        set_temp("apply/attack", 300);
        set_temp("apply/unarmed_damage", 500);
        set_temp("apply/armor", 1000);

        if (clonep(this_object()))
        {
                set("chat_chance", 30);
                set("chat_msg", ({ (: random_move :) }));
                set("born_time", time());
                keep_heart_beat();
        }

        setup();
}

void fight_ob(object ob)
{
        if (is_fighting(ob))
                return;

        message_vision(HIW "$N" HIW "冷哼一声，一股云气自身后"
                       "升起，似真似幻。\n" NOR, this_object(), ob);

        ::fight_ob(ob);
        if (! is_killing(ob->query("id")))
                kill_ob(ob);
}

int accept_fight(object ob)
{
        message_vision("$N扫了$n一眼，没有理$n。\n",
                       this_object(), ob);
        return 0;
}

int accept_kill(object ob)
{
        return 1;
}

int accept_hit(object ob)
{
        return 1;
}

mixed hit_ob(object me, object ob, int damage_bouns)
{
        ob->receive_wound("qi", 200 + random(200), me);
        me->set("neili", me->query("max_neili"));
        return HIY "$N" HIY "身上闪过一道电光，登时令$n"
               HIY "浑身麻木，手脚酸软。\n" NOR;
}

void unconcious()
{
        die();
}

void die()
{
        object ob;

        ob = new("/clone/gift/cdiamond");
        command("chat 呀！想不到凡人也有如此厉害的！");
        message_sort(HIR "$N" HIR "吐一口鲜血，驾云而去。只听叮玲玲一声"
                     "轻响，$N" HIR "\n掉下了一" + ob->query("unit") +
                     ob->name() + HIR "。\n", this_object());
        ob->move(environment());
        destruct(this_object());
}

void random_move()
{
        if (time() - query("born_time") > 1800)
        {
                message_vision("$N急急忙忙的走了。\n", this_object());
                CHANNEL_D->do_channel(this_object(), "rumor",
                        "听说" + name() + HIM "修炼良久，元气恢复，"
                        "已经安然返回神界。" NOR);
                destruct(this_object());
                return;
        }
        NPC_D->random_move(this_object());
}
