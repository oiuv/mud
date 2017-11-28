// zhu.c 朱熹

inherit NPC;
#include <ansi.h>

string ask_buy();
int ask_degree();
void create()
{
        set_name("老先生", ({ "lao xiansheng", "lao", "xiansheng"}));
        set("long",
"这位老先生曾中过状元，做过大官，现因年老回老家襄阳颐养天年，经
安抚使吕文德的再三邀请，在这儿为秀才们讲课。\n");
        set("gender", "男性");
        set("age", 65);
        set("no_get", 1);
        set_skill("literate", 300);

        set_skill("unarmed", 20);
        set_skill("dodge", 20);
        set_skill("parry", 20);
        set_temp("apply/attack", 20);
        set_temp("apply/defense", 20);
        set_temp("apply/damage", 10);

        set("combat_exp", 4000);
        set("shen_type", 1);
        setup();
}

int recognize_apprentice(object ob)
{
        if (!(int)ob->query_temp("mark/朱"))
                return 0;
        ob->add_temp("mark/朱", -1);
        return 1;
}

int accept_object(object who, object ob)
{
        object me = this_player();
        if (!(int)who->query_temp("mark/朱"))
                who->set_temp("mark/朱", 0);
        if (ob->query("money_id") && ob->value() >= 1000)
        {
                message_vision("老先生同意指点$N一些读书写字的问题。\n", who);
                who->add_temp("mark/朱", ob->value() / 50);
                if( me->query_skill("literate", 1) > 21)
                {
tell_object(me,"你现在已有一定的文化知识，也可以自己读书深造了。\n");
                        return 1;
                }
                return 1;
        }
}

