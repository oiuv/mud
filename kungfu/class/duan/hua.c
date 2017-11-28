#include <ansi.h>
#include "duan.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("华赫艮", ({ "hua hegen", "hua", "hegen" }));
        set("title", "大理国护国三公" );
        set("nickname", HIW "司徒" NOR);
        set("long", @LONG
他是大理国三大公之一。华司徒本名阿根，出身贫
贱，现今在大理国位列三公，未发迹时，干部的却
是盗墓掘坟的勾当，  最擅长的本领是偷盗王公巨
贾的坟墓。这些富贵人物死后，必有珍异宝物殉葬，
华阿根从极远处挖掘地道，通入坟墓，然后盗取宝
物。所花的一和虽巨，却由此而从未为人发觉。有
一次他掘入一坟，在棺木中得到了一本殉葬的武功
秘诀，依法修习，练成了一身卓绝的外门功夫，便
舍弃了这下贱的营生，辅佐保定帝，累立奇功，终
于升到司徒之职。
LONG);
        set("gender", "男性");
        set("age", 46);
        set("class", "officer");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 30);
        set("int", 20);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 3000);
        set("max_jing", 1800);
        set("neili", 3200);
        set("max_neili", 3200);
        set("jiali", 150);
        set("combat_exp", 1500000);
        set("score", 10000);

        set_skill("force", 180);
        set_skill("duanshi-xinfa", 180);
        set_skill("dodge", 180);
        set_skill("tiannan-bu", 180);
        set_skill("cuff", 160);
        set_skill("jinyu-quan", 160);
        set_skill("strike", 160);
        set_skill("wuluo-zhang", 160);
        set_skill("claw", 180);
        set_skill("yuezhao-gong", 180);
        set_skill("parry", 180);
        set_skill("literate", 120);
        set_skill("martial-cognize", 160);

        map_skill("force", "duanshi-xinfa");
        map_skill("dodge", "tiannan-bu");
        map_skill("cuff", "jinyu-quan");
        map_skill("strike", "wuluo-zhang");
        map_skill("claw", "yuezhao-gong");
        map_skill("parry", "yuezhao-gong");

        prepare_skill("claw", "yuezhao-gong");

        set("inquiry", ([
                "弑元诀"   : (: ask_skill1 :),
        ]));

        create_family("段氏皇族", 15, "司徒");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "claw.shi" :),
                (: exert_function, "recover" :),
        }));

        setup();
        carry_object("/d/dali/npc/obj/junfu")->wear();
        add_money("silver", 10);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("smile");
        command("say 世子殿下何需如此，只要有事吩咐在下一声便是。");
        command("say 若世子不嫌弃，我这里倒是有一套爪法可以传授予你。");

        return;
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "段氏皇族")
        {
                command("sneer");
                command("say 我与阁下素不相识，不知阁下此话从何说起？");
                return -1;
        }

        if (skill != "yuezhao-gong" && skill != "claw")
        {
                command("say 我生平所就这套爪法最为精妙，其它的还是让王爷亲自教你吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/huahegen"))
        {
                command("nod");
                command("say 既然世子有心习武，在下理当竭尽所能传授。");
                ob->set_temp("can_learn/huahegen", 1);
        }
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/yuezhao-gong/shi"))
                return "我不是已经教给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和我素无瓜葛，何出此言？";

        if (me->query_skill("yuezhao-gong", 1) < 1)
                return "哈哈，你连我越爪功都未学，怎么来绝招一说？";

        if (me->query("gongxian") < 400)
                return "恕在下无礼，王爷吩咐过，不得传功给无功子弟。";

        if (me->query_skill("force") < 200)
                return "你的内功修为太差，学不了这一招。";

        if ((int)me->query("max_neili", 1) < 1800)
                return "你的内力修为太差，学不了这一招。";

        if (me->query_skill("yuezhao-gong", 1) < 130)
                return "你越爪功的火候还不够，学不了这一招。";

        message_sort(HIY "\n$n" HIY "哈哈一笑，对$N" HIY "赞许的说道：“想"
                     "不到世子殿下的爪法造诣竟然如此精湛，今日华某便传你这"
                     "招。”说罢，$n" HIY "随即摆开架势，慢慢的演示招数。\n"
                     "\n" NOR, me, this_object()); 

        command("nod");
        command("say 这招看似花巧，其实并不难练，下去后仍需勤加练习。");
        tell_object(me, HIC "你学会了「弑元诀」。\n" NOR);
        if (me->can_improve_skill("claw"))
                me->improve_skill("claw", 1500000);
        if (me->can_improve_skill("yuezhao-gong"))
                me->improve_skill("yuezhao-gong", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/yuezhao-gong/shi", 1);
        me->add("gongxian", -400);
        return 1;
}
