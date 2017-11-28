#include <ansi.h>
#include "quanzhen.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_skill1();
mixed ask_skill2();

void create()
{
        set_name("王处一", ({ "wang chuyi", "wang", "chuyi" }));
        set("long", @LONG
他就是全真七子之五的王处一王真人。他身材
修长服饰整洁，三绺黑须飘在胸前，神态潇洒。
LONG);
        set("nickname", RED "玉阳子" NOR);
        set("title", "全真七子");
        set("gender", "男性");
        set("age", 41);
        set("class", "taoist");
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 30);
        set("int", 29);
        set("con", 29);
        set("dex", 29);

        set("max_qi", 4200);
        set("max_jing", 3000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 150);

        set("combat_exp", 2500000);

        set_skill("force", 240);
        set_skill("quanzhen-xinfa", 240);
        set_skill("xuanmen-neigong", 240);
        set_skill("sword", 240);
        set_skill("qixing-jian", 240);
        set_skill("quanzhen-jian", 240);
        set_skill("dodge", 220);
        set_skill("tianshan-feidu", 220);
        set_skill("parry", 220);
        set_skill("strike", 200);
        set_skill("chongyang-shenzhang", 200);
        set_skill("haotian-zhang", 200);
        set_skill("finger", 200);
        set_skill("zhongnan-zhi", 200);
        set_skill("literate", 220);
        set_skill("taoism", 220);
        set_skill("martial-cognize", 220);

        map_skill("force", "xuanmen-neigong");
        map_skill("sword", "quanzhen-jian");
        map_skill("dodge", "tianshan-feidu");
        map_skill("parry", "quanzhen-jian");
        map_skill("finger", "zhongnan-zhi");
        map_skill("strike", "haotian-zhang");

        prepare_skill("strike", "haotian-zhang");

        create_family("全真教", 2, "弟子");

        set("inquiry", ([
                "缠字诀" : (: ask_skill1 :),
                "定阳针" : (: ask_skill2 :),
        ]) );

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.chan" :),
                (: perform_action, "sword.ding" :),
                (: perform_action, "strike.ju" :),
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

        if ((int)ob->query_skill("xuanmen-neigong", 1) < 80
           && (int)ob->query_skill("quanzhen-xinfa", 1) < 80)
        {
                command("say 你的本门内功心法火候不足，难以领略更高深的武功。");
                return;
        }

        if ((int)ob->query_skill("taoism", 1) < 80)
        {
                command("say 你在修身养性方面还需多加锻炼，等你道学心法够高后再来吧。");
                return;
        }

        if ((int)ob->query("shen") < 10000)
        {
                command("say 你这人行侠仗义的事情做得太少！\n");
                return;
        }

        command("nod");
        command("say 好吧，我就收下你了。");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/quanzhen-jian/chan"))
                return "这招我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫道素不相识，不知此话从何说起？";

        if (me->query_skill("quanzhen-jian", 1) < 1)
                return "你连全真剑法都没学，何谈绝招可言？";

        if (me->query("gongxian") < 200)
                return "你在我全真教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 10000)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("quanzhen-jian", 1) < 80)
                return "你的全真剑法不够娴熟，练高点再来吧。";

        if (me->query_skill("force") < 100)
                return "你的内功修为不够，修炼高后再来找我吧。";

        message_sort(HIY "\n$n" HIY "微笑着点了点头，说道：“看好了。”说"
                     "罢即抽出腰间长剑，慢慢演示起来。只见$n" HIY "剑招紧"
                     "密圆动，连绵不绝，内力便如细丝般从长剑剑锋透出，带出"
                     "阵阵风声。直看得$N" HIY "目瞪口呆。\n\n" NOR, me,
                     this_object()); 

        command("nod");
        command("say 此招无非是以剑招迷惑对手，并无复杂之举。");
        tell_object(me, HIC "你学会了「缠字诀」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("quanzhen-jian"))
                me->improve_skill("quanzhen-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/quanzhen-jian/chan", 1);
        me->add("gongxian", -200);

        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();

        if (me->query("can_perform/quanzhen-jian/ding"))
                return "这招我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫道素不相识，不知此话从何说起？";

        if (me->query_skill("quanzhen-jian", 1) < 1)
                return "你连全真剑法都没学，何谈绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在我全真教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 12000)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("quanzhen-jian", 1) < 100)
                return "你的全真剑法不够娴熟，练高点再来吧。";

        if (me->query_skill("force") < 150)
                return "你的内功修为不够，修炼高后再来找我吧。";

        message_sort(HIY "\n$n" HIY "点了点头，喝道：“看仔细了。”话音刚"
                     "落，只见$n" HIY "脚下左弓右箭，深深吸入一口气，神气"
                     "完足如雷霆五岳，电光火石间一剑斜斜刺出，顿时只听得“"
                     "哧”的一声，$N" HIY "脚下的方砖竟然应声而碎，裂成了"
                     "数块。\n\n" NOR, me, this_object()); 

        command("nod");
        command("say 此招的精要无非是以气驾剑，达至随心所欲。");
        tell_object(me, HIC "你学会了「定阳针」。\n" NOR);
        if (me->can_improve_skill("sword"))
                me->improve_skill("sword", 1500000);
        if (me->can_improve_skill("quanzhen-jian"))
                me->improve_skill("quanzhen-jian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/quanzhen-jian/ding", 1);
        me->add("gongxian", -400);

        return 1;
}
