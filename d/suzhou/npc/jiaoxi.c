// jiaoxi.c

inherit NPC;
inherit F_DEALER;
#include <ansi.h>

void create()
{
        set_name("老夫子", ({ "lao fuzi", "lao", "fuzi" }));
        set("long",
"一个唯利是图的苏州老教习，肚子里有墨水，可你还要有钱。\n");
        set("gender", "男性");
        set("age", 65);
        set_skill("literate", 200);

        set_skill("unarmed", 20);
        set_skill("dodge", 20);
        set_skill("parry", 20);
        set_temp("apply/attack", 20);
        set_temp("apply/defense", 20);
        set_temp("apply/damage", 20);

        set("combat_exp", 40000);
        set("shen_type", 1);
        set("inquiry", ([
            "书"   : "唉!书到用时方恨少。",
            "借书" : "借？你不还我到哪里找你？哼!",
        ]));
        setup();

}

int recognize_apprentice(object ob)
{
        if (!(int)ob->query_temp("mark/朱2"))
                return 0;
        ob->add_temp("mark/朱2", -1);
        return 1;
}

int accept_object(object who, object ob)
{
//      object me = this_player();
        if (!(int)who->query_temp("mark/朱2")) who->set_temp("mark/朱2", 0);
        if (ob->query("money_id") && ob->value() >= 500)
        {
                message_vision("老夫子同意指点$N一些读书写字的问题。\n", who);
                who->add_temp("mark/朱2", ob->value() / 50);
                return 1;
        }
}
