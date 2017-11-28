#include <ansi.h>
#include "quanzhen.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("郝大通", ({ "hao datong", "hao", "datong" }));
        set("long", @LONG
他就是全真七子中的郝大通郝真人。他身材微
胖，象个富翁模样，身上穿的道袍双袖皆无。
LONG);
        set("nickname", HIG "广宁子" NOR);
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
        set("neili", 4800);
        set("max_neili", 4800);
        set("jiali", 150);

        set("combat_exp", 2000000);

        set_skill("force", 220);
        set_skill("quanzhen-xinfa", 220);
        set_skill("xuanmen-neigong", 220);
        set_skill("sword", 200);
        set_skill("qixing-jian", 200);
        set_skill("quanzhen-jian", 200);
        set_skill("dodge", 200);
        set_skill("tianshan-feidu", 200);
        set_skill("parry", 200);
        set_skill("strike", 200);
        set_skill("chongyang-shenzhang", 200);
        set_skill("finger", 200);
        set_skill("zhongnan-zhi", 200);
        set_skill("hand", 220);
        set_skill("qixing-shou", 220);
        set_skill("literate", 200);
        set_skill("taoism", 200);
        set_skill("martial-cognize", 180);

        map_skill("force", "xuanmen-neigong");
        map_skill("sword", "quanzhen-jian");
        map_skill("dodge", "tianshan-feidu");
        map_skill("hand", "qixing-shou");
        map_skill("parry", "qixing-shou");
        map_skill("finger", "zhongnan-zhi");
        map_skill("strike", "chongyang-shenzhang");

        prepare_skill("hand", "qixing-shou");

        create_family("全真教", 2, "弟子");

        set("inquiry", ([
                "破穹云蛟" : (: ask_skill1 :),
        ]) );

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.po" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        setup();

        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query_skill("xuanmen-neigong", 1) < 60
           && (int)ob->query_skill("quanzhen-xinfa", 1) < 60)
        {
                command("say 你的本门内功心法火候不足，难以领略更高深的武功。");
                return;
        }

        if ((int)ob->query_skill("taoism", 1) < 60)
        {
                command("say 你在修身养性方面还需多加锻炼，等你道学心法够高后再来吧。");
                return;
        }

        if ((int)ob->query("shen") < 8000)
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

        if (me->query("can_perform/qixing-shou/po"))
                return "这招我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫道素不相识，不知此话从何说起？";

        if (me->query_skill("qixing-shou", 1) < 1)
                return "你连七星分天手都没学，何谈绝招可言？";

        if (me->query("gongxian") < 800)
                return "你在我全真教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 30000)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("qixing-shou", 1) < 150)
                return "你的七星分天手不够娴熟，练高点再来吧。";

        if (me->query_skill("force") < 200)
                return "你的内功修为不够，修炼高后再来找我吧。";

        message_sort(HIY "\n$n" HIY "微微一笑，从怀中轻轻取出了一本"
                     "小册子，指着其中的一段对$N" HIY "细说良久，$N"
                     HIY "一边听一边点头。\n\n" NOR, me,
                     this_object()); 

        command("nod");
        command("say 你自己下去练吧。");
        tell_object(me, HIC "你学会了「破穹云蛟」。\n" NOR);
        if (me->can_improve_skill("hand"))
                me->improve_skill("hand", 1500000);
        if (me->can_improve_skill("qixing-shou"))
                me->improve_skill("qixing-shou", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/qixing-shou/po", 1);
        me->add("gongxian", -800);

        return 1;
}
