// Npc: /kungfu/class/shaolin/qing-fa.c
// Date: YZC 96/01/19

inherit NPC;
inherit F_MASTER;

#define DEFINED_ATTEMPT_APPRENTICE

#include "qing.h"

string ask_for_join();

void create()
{
        set_name("清法比丘", ({
                "qingfa biqiu",
                "qingfa",
                "biqiu",
        }));
        set("long",
                "他是一位体格强健的壮年僧人，他生得虎背熊腰，全身似乎蕴含\n"
                "着无穷劲力。他身穿一袭白布黑边袈裟，似乎身怀武艺。\n"
        );


        set("gender", "男性");
        set("attitude", "friendly");
        set("class", "bonze");

        set("inquiry",([
                "剃度"  : (: ask_for_join :),
                "出家"  : (: ask_for_join :),
        ]));

        set("age", 30);
        set("shen_type", 1);
        set("str", 25);
        set("int", 17);
        set("con", 50);
        set("dex", 21);
        set("max_qi", 450);
        set("max_jing", 200);
        set("neili", 350);
        set("max_neili", 350);
        set("jiali", 30);
        set("combat_exp", 5000);
        set("score", 100);

        set_skill("force", 30);
        set_skill("shaolin-xinfa", 30);
        set_skill("dodge", 50);
        set_skill("shaolin-shenfa", 50);
        set_skill("cuff", 50);
        set_skill("jingang-quan", 50);
        set_skill("parry", 30);
        set_skill("buddhism", 30);
        set_skill("literate", 30);
        set_skill("sword", 30);
        set_skill("qingliang-jian", 30);
        
        map_skill("force", "shaolin-xinfa");
        map_skill("dodge", "shaolin-shenfa");
        map_skill("cuff", "jingang-quan");
        map_skill("parry", "jingang-quan");
        map_skill("sword", "qingliang-jian");

        prepare_skill("cuff", "jingang-quan");

        create_family("少林派", 40, "弟子");

        setup();

        carry_object("/d/shaolin/obj/qing-cloth")->wear();
}

void init()
{
        add_action("do_kneel", "kneel");
}

string ask_for_join()
{
        object me;

        me = this_player();

        if( (string)me->query("class")=="bonze" )
                return "阿弥陀佛！你我同是出家人，何故跟贫僧开这等玩笑？\n";

        if( (string)me->query("gender") == "无性" )
                return "阿弥陀佛！善哉！善哉！这位公公，你还是回去伺候皇上吧。\n";

        if( (string)me->query("gender") == "女性" )
                return "阿弥陀佛！善哉！善哉！女施主若真心皈依我佛，可去后山庵里受戒。\n";

        me->set_temp("pending/join_bonze", 1);
        return "阿弥陀佛！善哉！善哉！施主若真心皈依我佛，请跪下(kneel)受戒。\n";
}

int do_kneel()
{
        object me = this_player();

        string *prename =
         ({ "虚", "空", "明", "净" });
//       ({ "虚", "空", "明", "圆", "净", "悟", "法" });
        string name, new_name;

        if( !me->query_temp("pending/join_bonze") )
                return 0;

        message_vision(
                "$N双手合十，恭恭敬敬地跪了下来。\n\n"
                "$n伸出手掌，在$N头顶轻轻地摩挲了几下，将$N的头发尽数剃去。\n\n",
                me, this_object() );
        name = me->query("name");
        new_name = prename[random(sizeof(prename))] + name[0..1];
        command("say 从今以后你的法名叫做" + new_name + "。");
        command("smile");
        me->delete_temp("pending/join_bonze");

        me->set("name", new_name);
        me->set("class", "bonze");
        me->set("K_record", me->query("PKS") + me->query("MKS"));
        me->set("shen_record", me->query("shen"));
        me->set("shen", 0);

        return 1;
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((string)ob->query("gender") == "女性")
        {
                command ("say 阿弥陀佛！女施主呀，贫僧可不敢开这等玩笑啊。");
                return;
        }

        if ((string)ob->query("gender") == "无性")
        {
                command ("say 阿弥陀佛！这位公公，你还是回去伺候皇上吧。");
                return;
        }
        
        if ((string)ob->query("class") != "bonze")
        {
                command ("say 阿弥陀佛！贫僧就收下你做『俗家弟子』了。");
        }
        command("say 阿弥陀佛，善哉！善哉！");
        command("recruit " + ob->query("id"));
}


