inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#include <ansi.h>
#include "xuedao.h"

string ask_for_join();
int do_kneel();

void create()
{
        set_name("善勇", ({ "shan yong", "shan", "yong" }));
        set("long", @LONG
一个胖胖的西藏僧人，面带笑容，却常干笑里藏刀的事。
LONG);
        set("gender", "男性");
        set("age", 35);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 22);
        set("int", 21);
        set("con", 22);
        set("dex", 19);
        set("max_qi", 2800);
        set("max_jing", 1400);
        set("neili", 2600);
        set("max_neili", 2600);
        set("jiali", 15);
        set("combat_exp", 75000);

        set_skill("force", 120);
        set_skill("mizong-neigong", 120);
        set_skill("parry", 120);
        set_skill("blade", 120);
        set_skill("xueshan-dao", 120);
        set_skill("dodge", 120);
        set_skill("shenkong-xing", 120);
        set_skill("hand", 120);
        set_skill("dashou-yin", 120);
        set_skill("cuff", 120);
        set_skill("yujiamu-quan", 120);
        set_skill("lamaism", 140);
        set_skill("literate", 140);
        set_skill("martial-cognize", 100);

        map_skill("force", "mizong-neigong");
        map_skill("dodge", "shenkong-xing");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");
        map_skill("parry", "xueshan-dao");
        map_skill("blade", "xueshan-dao");

        prepare_skill("cuff", "yujiamu-quan");
        prepare_skill("hand", "dashou-yin");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "blade.kai" :),
                (: perform_action, "hand.yin" :),
                (: perform_action, "cuff.jiang" :),
                (: exert_function, "recover" :),
        }) );

        set("inquiry",([
                "剃度" : (: ask_for_join :),
                "出家" : (: ask_for_join :),
        ]));

        create_family("血刀门", 5, "弟子");
        set("class", "bonze");

        setup();
        carry_object("/d/xueshan/obj/y-jiasha")->wear();
        carry_object("/clone/weapon/gangdao")->wield();
}

void init()
{
        add_action("do_kneel", "kneel");

}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((string)ob->query("gender") == "女性")
        {
                command("say 我不收女徒弟。\n");
                return;
        }

        if ((string)ob->query("gender") != "男性")
        {
                command("say 公公别开玩笑了，还是赶快回宫去伺候皇上吧。\n");
                return;
        }

        if (ob->query("class") != "bonze")
        {
                ob->set_temp("pending/join_bonze", 1);
                command("say 你不是出家人，我们血刀门是不会收留的。如果你"
                        "决定要出家，就跪下吧(" HIY "kneel" NOR + CYN ")。" NOR);
                return;
        }

        command("recruit " + ob->query("id"));
}

string ask_for_join()
{
        object me;

        me = this_player();

        if ((string)me->query("class") == "bonze")
                return "阿弥陀佛！你我同是出家人，何故跟贫僧开这等玩笑？\n";

        if ((string)me->query("gender") == "女性")
                return "施主若真心向佛，真是可喜可贺，可惜本寺不收女徒。\n";

        if ((string)me->query("gender") != "男性")
                return "公公别开玩笑了，还是赶快回宫去伺候皇上吧。\n";

        me->set_temp("pending/join_bonze", 1);
        return "阿弥陀佛！善哉！善哉！施主若真心皈依我佛，请跪下(kneel)受戒。\n";
}

int do_kneel()
{
        object me = this_player();

        if (! me->query_temp("pending/join_bonze"))
                return notify_fail("你跪了半点，结果没人理你。\n");

        message_vision(HIY "$N" HIY "双手合十，恭恭敬敬地跪了下来。\n\n"
                       "$n" HIY "伸出手掌，在$N" HIY "头顶轻轻地摩挲了几"
                       "下，将$N" HIY "的头发尽数剃去。\n\n" NOR, me,
                       this_object());

        command("ke");

        me->set("class", "bonze");
        command("recruit " + me->query("id"));

        return 1;
}
