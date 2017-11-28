#include <ansi.h>
#include "xueshan.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
        set_name("达尔巴", ({ "da erba", "da", "erba" }));
        set("long", @LONG
他是金轮法王座下的大弟子。深得法王的真传。
身穿一件黄色袈裟，头带僧帽。
LONG);
        set("nickname", HIY "金刚佛" NOR);
        set("gender", "男性");
        set("class", "bonze");
        set("age", 38);
        set("attitude", "peaceful");
        set("shen_type", -1);

        set("str", 35);
        set("int", 20);
        set("con", 25);
        set("dex", 20);

        set("max_qi", 3500);
        set("max_jing", 2500);
        set("neili", 4000);
        set("max_neili", 4000);
        set("jiali", 150);
        set("combat_exp", 800000);

        set_skill("force", 180);
        set_skill("mizong-neigong", 180);
        set_skill("dodge", 160);
        set_skill("shenkong-xing", 160);
        set_skill("hammer", 180);
        set_skill("dali-chu", 160);
        set_skill("xiangmo-chu", 180);
        set_skill("hand", 160);
        set_skill("dashou-yin", 160);
        set_skill("cuff", 160);
        set_skill("yujiamu-quan", 160);
        set_skill("parry", 160);
        set_skill("lamaism", 180);
        set_skill("literate", 100);
        set_skill("sanscrit", 200);
        set_skill("martial-cognize", 160);

        map_skill("force", "mizong-neigong");
        map_skill("dodge", "shenkong-xing");
        map_skill("parry", "xiangmo-chu");
        map_skill("hammer", "xiangmo-chu");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");

        prepare_skill("cuff", "yujiamu-quan");
        prepare_skill("hand", "dashou-yin");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "hammer.zhen" :),
                (: perform_action, "hand.yin" :),
                (: perform_action, "cuff.jiang" :),
                (: exert_function, "recover" :),
        }));

        create_family("大轮寺", 2, "弟子");

        set("inquiry", ([
                "轰雷万钧" : (: ask_skill1 :),
                "镇魂舞"   : (: ask_skill2 :),
        ]));

        setup();

        carry_object("/d/xueshan/obj/gangchu")->wield();
        carry_object("/d/xueshan/obj/y-jiasha")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((string)ob->query("gender") != "男性")
        {
                command("say 修习密宗内功需要纯阳之体，你还是走吧。");
                return;
        }

        if ((string)ob->query("class") != "bonze")
        {
                command("say 我们大轮寺只收出家弟子，你还是请回吧。");
                return;
        }

        if ((int)ob->query("shen") > -3000)
        {
                command("say 我从来不和正派人士打交道，你还是走吧。");
                return;
        }

        if ((int)ob->query_skill("mizong-neigong", 1) < 50)
        {
                command("say 你内功这么差，怎么修行高深的武技？");
                return;
        }

        if ((int)ob->query_skill("lamaism", 1) < 30)
        {
                command("say 嗯，你有空还是多修修密宗心法吧。");
                return;
        }

        command("say 这个…那你以后就跟着我练武吧！");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/dali-chu/hong"))
                return "你又来干什么？自己下去多练。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "我又不认识你，打听这个干什么？";

        if (me->query_skill("dali-chu", 1) < 1)
                return "你连无上大力杵都没学，哪里来绝招？";

        if (me->query("gongxian") < 100)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -3000)
                return "你为人太过心软，这招暂时还不能传你。";

        if (me->query_skill("force") < 120)
                return "你的内功修为不足，还学不了这一招。";

        if (me->query("max_neili") < 800)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("dali-chu", 1) < 80)
                return "等你把无上大力杵练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "对$N" HIY "点了点头，喝道：“瞧仔"
                     "细了。”话音刚落，只见$n" HIY "高举手中的钢杵，在"
                     "空中挥舞成盘，气势惊人！便在此时，那柄钢杵已携带"
                     "着震天撞击之声猛然击落。直把$N" HIY "看得目瞪口呆"
                     "。\n\n" NOR, me, this_object());

        command("nod");
        command("say 看明白了就自己下去练吧。");
        tell_object(me, HIC "你学会了「轰雷万钧」。\n" NOR);

        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("dali-chu"))
                me->improve_skill("dali-chu", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/dali-chu/hong", 1);
        me->add("gongxian", -100);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xiangmo-chu/zhen"))
                return "我不是让你自己下去练吗，怎么又来了？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "我又不认识你，打听这个干什么？";

        if (me->query_skill("xiangmo-chu", 1) < 1)
                return "你连金刚降魔杵都没学，哪里来绝招？";

        if (me->query("gongxian") < 200)
                return "你为大轮寺效力不够，这招暂时还不能传你。";

        if (me->query("shen") > -6000)
                return "你为人太过心软，这招暂时还不能传你。";

        if (me->query_skill("force") < 150)
                return "你的内功修为不足，还学不了这一招。";

        if (me->query("max_neili") < 1500)
                return "你的内力修为不足，还是修炼高点再来吧。";

        if (me->query_skill("xiangmo-chu", 1) < 100)
                return "等你把金刚降魔杵练熟了再来找我。";

        message_sort(HIY "\n$n" HIY "对$N" HIY "点了点头，喝道：“看清"
                     "楚了。”话音刚落，只见$n" HIY "高举手中的钢杵，在"
                     "空中挥舞成盘，宝相庄严，气度万千。霎时间幻出重重"
                     "杵影，朝四面八方砸下。招式精奇，令人叹为观止。\n"
                     "\n" NOR, me, this_object());

        command("nod");
        command("say 这招看似复杂，其实并不难，你下去体会吧。");
        tell_object(me, HIC "你学会了「镇魂舞」。\n" NOR);

        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("xiangmo-chu"))
                me->improve_skill("xiangmo-chu", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xiangmo-chu/zhen", 1);
        me->add("gongxian", -200);

        return 1;
}
