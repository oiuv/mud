#include <ansi.h>
#include "xueshan.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("霍都", ({ "huo du", "huo", "du" }));
        set("long", @LONG
他是金轮法王座下的二弟子。深得法王的真传。
霍都贵为蒙古王子，地位极其尊贵。
LONG);
        set("nickname", HIY "蒙古王子" NOR);
        set("gender", "男性");
        set("age", 31);
        set("attitude", "peaceful");
        set("shen_type", -1);

        set("str", 35);
        set("int", 20);
        set("con", 25);
        set("dex", 20);

        set("max_qi", 3200);
        set("max_jing", 2200);
        set("neili", 3800);
        set("max_neili", 3800);
        set("jiali", 120);
        set("combat_exp", 800000);

        set_skill("force", 180);
        set_skill("mizong-neigong", 180);
        set_skill("dodge", 160);
        set_skill("shenkong-xing", 160);
        set_skill("dagger", 180);
        set_skill("finger", 180);
        set_skill("poxu-daxuefa", 180);
        set_skill("sword", 160);
        set_skill("mingwang-jian", 160);
        set_skill("hand", 160);
        set_skill("dashou-yin", 160);
        set_skill("cuff", 160);
        set_skill("yujiamu-quan", 160);
        set_skill("parry", 160);
        set_skill("lamaism", 180);
        set_skill("literate", 100);
        set_skill("sanscrit", 100);
        set_skill("martial-cognize", 160);

        map_skill("force", "mizong-neigong");
        map_skill("dodge", "shenkong-xing");
        map_skill("parry", "poxu-daxuefa");
        map_skill("sword", "mingwang-jian");
        map_skill("dagger", "poxu-daxuefa");
        map_skill("finger", "poxu-daxuefa");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");

        prepare_skill("finger", "poxu-daxuefa");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "finger.tong" :),
                (: exert_function, "recover" :),
        }));

        create_family("大轮寺", 2, "弟子");

        set("inquiry", ([
                "破元通虚" : (: ask_skill1 :),
        ]));

        setup();

        carry_object("/d/xueshan/obj/gushan")->wield();
        carry_object("/d/city/npc/cloth/fu-cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((string)ob->query("gender") == "女性")
        {
                command("say 嘿？你一个姑娘跑到大轮寺来干什么？");
                return;
        }

        if ((string)ob->query("gender") != "男性")
        {
                command("say 我平生最讨厌不男不女的阉人，给我滚开。");
                return;
        }

        if ((string)ob->query("class") != "bonze")
        {
                command("say 大轮寺除了我以外全是喇嘛，你自然也不能破例。");
                return;
        }

        if ((int)ob->query("shen") > -5000)
        {
                command("say 我从来不和正派人士打交道，给我滚开。");
                return;
        }

        if ((int)ob->query_skill("mizong-neigong", 1) < 50)
        {
                command("say 你内功这么差，也好意思来麻烦我？");
                return;
        }

        command("nod");
        command("say 小王看得起你，以后就跟着我吧。");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/poxu-daxuefa/tong"))
                return "这招小王不是已经教过你了么？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "给我滚开！";

        if (me->query_skill("poxu-daxuefa", 1) < 1)
                return "你连破虚打穴法都没学，跟小王罗嗦什么？";

        if (me->query("gongxian") < 400)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -10000)
                return "嘿！你为人如此正派，看来这招不适合你。";

        if (me->query_skill("force") < 160)
                return "你的内功修为不足，还学不了这一招。";

        if (me->query_skill("poxu-daxuefa", 1) < 120)
                return "等你把破虚打穴法练熟了再来找小王吧。";

        message_sort(HIY "\n$n" HIY "沉思片刻，方才点了点头，伸手将$N" HIY
                     "招至身边，俯身在$P" HIY "耳旁低声细说良久，$N" HIY
                     "听后不禁会心的一笑，似乎对$n" HIY "的教导大有所悟"
                     "。\n\n" NOR, me, this_object());

        command("grin");
        command("say 这招的精髓都告诉你了，可得用心练习。");
        tell_object(me, HIC "你学会了「破元通虚」。\n" NOR);

        if (me->can_improve_skill("dagger"))
                me->improve_skill("dagger", 1500000);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("poxu-daxuefa"))
                me->improve_skill("poxu-daxuefa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/poxu-daxuefa/tong", 1);
        me->add("gongxian", -400);

        return 1;
}
