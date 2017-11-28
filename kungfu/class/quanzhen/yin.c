#include <ansi.h>
#include "quanzhen.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
        set_name("尹志平", ({ "yin zhiping", "yin", "zhiping" }));
        set("gender", "男性");
        set("age", 24);
        set("class", "taoist");
        set("long", @LONG
他是丘处机的得意大弟子尹志平，他粗眉大眼，
长的有些英雄气概，在全真教第三代弟子中算
得上年轻有为。身材不高，眉宇间似乎有一股
忧郁之色。长的倒是长眉俊目，容貌秀雅，面
白无须，可惜朱雀和玄武稍有不和。
LONG);
        set("nickname", HIC "清和真人" NOR);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 25);
        set("int", 25);
        set("con", 24);
        set("dex", 24);

        set("max_qi", 3000);
        set("max_jing", 2200);
        set("neili", 3500);
        set("max_neili", 3500);
        set("jiali", 100);

        set("combat_exp", 500000);

        set_skill("force", 160);
        set_skill("quanzhen-xinfa", 160);
        set_skill("xuanmen-neigong", 160);
        set_skill("sword", 160);
        set_skill("qixing-jian", 160);
        set_skill("dodge", 140);
        set_skill("tianshan-feidu", 140);
        set_skill("parry", 140);
        set_skill("strike", 140);
        set_skill("chongyang-shenzhang", 140);
        set_skill("finger", 160);
        set_skill("zhongnan-zhi", 160);
        set_skill("literate", 140);
        set_skill("taoism", 140);
        set_skill("martial-cognize", 140);

        map_skill("force", "xuanmen-neigong");
        map_skill("sword", "qixing-jian");
        map_skill("dodge", "tianshan-feidu");
        map_skill("parry", "qixing-jian");
        map_skill("finger", "zhongnan-zhi");
        map_skill("strike", "chongyang-shenzhang");

        prepare_skill("finger", "zhongnan-zhi");
        prepare_skill("strike", "chongyang-shenzhang");

        create_family("全真教", 3, "弟子");

        set("inquiry", ([
                "剑指南山" : (: ask_skill1 :),
                "群星璀璨" : (: ask_skill2 :),
        ]) );

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.xing" :),
                (: perform_action, "finger.zhi" :),
                (: perform_action, "strike.lian" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();

}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query_skill("xuanmen-neigong", 1) < 30
           && (int)ob->query_skill("quanzhen-xinfa", 1) < 30)
        {
                command("say 你的内功心法火候不足，再多练练吧。");
                return;
        }

        if ((int)ob->query("shen") < 3000)
        {
                command("say 你行侠仗义之事做得太少，我不能收你。\n");
                return;
        }

        command("say 既然如此，我就收下你这个徒弟。");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/zhongnan-zhi/zhi"))
                return "这招我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫道素不相识，不知此话从何说起？";

        if (me->query_skill("zhongnan-zhi", 1) < 1)
                return "你连终南指法都没学，何谈绝招可言？";

        if (me->query("gongxian") < 50)
                return "你在我全真教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 3000)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("zhongnan-zhi", 1) < 60)
                return "你的终南指法不够娴熟，练高点再来吧。";

        if (me->query_skill("force") < 80)
                return "你的内功修为不够，修炼高后再来找我吧。";

        message_sort(HIY "\n$n" HIY "对$N" HIY "点了点头，当下更不答"
                     "话，微微探出一指，斜刺而出。但见其指尖晃动不已"
                     "，招式连贯，颇为精奇。\n\n" NOR, me,
                     this_object()); 

        command("nod");
        command("say 这招很简单，稍加练习便成。");
        tell_object(me, HIC "你学会了「剑指南山」。\n" NOR);
        if (me->can_improve_skill("finger"))
                me->improve_skill("finger", 1500000);
        if (me->can_improve_skill("zhongnan-zhi"))
                me->improve_skill("zhongnan-zhi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/zhongnan-zhi/zhi", 1);
        me->add("gongxian", -50);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/qixing-jian/xing"))
                return "这招我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫道素不相识，不知此话从何说起？";

        if (me->query_skill("qixing-jian", 1) < 1)
                return "你连七星剑法都没学，何谈绝招可言？";

        if (me->query("gongxian") < 80)
                return "你在我全真教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 3500)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("qixing-jian", 1) < 60)
                return "你的七星剑法不够娴熟，练高点再来吧。";

        if (me->query_skill("force") < 80)
                return "你的内功修为不够，修炼高后再来找我吧。";

        message_sort(HIY "\n$n" HIY "微微点了点头，在$N" HIY "耳边轻声"
                     "说了些话，一边说还一边抽出长剑比划着剑招。过得良"
                     "久，$N" HIY "方才抬起头，似乎有了什么新的领悟。\n"
                     "\n" NOR, me, this_object()); 

        command("nod");
        command("say 你自己下去练习吧。");
        tell_object(me, HIC "你学会了「群星璀璨」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("qixing-jian"))
                me->improve_skill("qixing-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qixing-jian/xing", 1);
        me->add("gongxian", -80);

        return 1;
}
