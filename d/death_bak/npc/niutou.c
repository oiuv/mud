#include <ansi.h>

inherit NPC;

void create()
{
        set_name("牛头", ({ "niu tou", "niu", "tou" }) );
        set("title", HIR "冥府地藏王殿前" NOR);
        set("nickname", HIY "金盔" NOR + HIW "银甲" NOR);
        set("gender", "男性");
        set("age", 623);
        set("long", @LONG
一个高达仗许，牛头人身的怪物，看起来很不好惹。
LONG );
        set("str", 35);
        set("int", 35);
        set("con", 35);
        set("dex", 35);
        set("per", 35);

        set("max_qi", 7000);
        set("max_jing", 5000);
        set("max_neili", 9000);
        set("neili", 9000);
        set("jiali", 250);
        set("combat_exp", 8000000);

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: exert_function, "powerup" :),
                (: exert_function, "shield" :),
        }) );

        set_skill("dodge", 400);
        set_skill("strike", 400);
        set_skill("parry", 400);
        set_skill("unarmed", 400);
        set_skill("cuixin-zhang", 400);
        set_skill("wudu-shu", 400);
        set_skill("force", 400);
        set_skill("changsheng-jue", 400);
        set_skill("blade", 400);
        set_skill("badao-daofa", 400);
        set_skill("magic", 500);

        map_skill("force", "changsheng-jue");
        map_skill("blade", "badao-daofa");
        map_skill("dodge", "wudu-shu");
        map_skill("parry", "badao-daofa");
        map_skill("strike", "cuixin-zhang");
        map_skill("unarmed", "cuixin-zhang");

        prepare_skill("strike", "cuixin-zhang");

        setup();

        carry_object(__DIR__"obj/armor1")->wear();
        carry_object(__DIR__"obj/armor2")->wear();
        carry_object(__DIR__"obj/blade1")->wield();
}

void fight_ob(object ob)
{
        if (is_fighting(ob))
                return;

        message_vision(HIR "$N" HIR "大怒，一声暴喝，身后"
                       "登时腾起无数冤魂，一齐恸哭哀嚎。\n" NOR, this_object(), ob);

        ::fight_ob(ob);
        if (! is_killing(ob->query("id")))
                kill_ob(ob);
}

int accept_fight(object ob)
{
        return 1;
}

int accept_kill(object ob)
{
        return 1;
}

int accept_hit(object ob)
{
        return 1;
}
