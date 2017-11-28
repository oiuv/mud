#include <ansi.h>
#include "quanzhen.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("孙不二", ({ "sun buer", "sun", "buer" }));
        set("long", @LONG
她就是全真教二代弟子中唯一的女弟子孙不二
孙真人。她本是马钰入道前的妻子，道袍上绣
着一个骷髅头。
LONG);
        set("nickname", CYN "清净散人" NOR);
        set("title", "全真七子");
        set("gender", "女性");
        set("age", 33);
        set("class", "taoist");
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("str", 30);
        set("int", 29);
        set("con", 29);
        set("dex", 29);

        set("max_qi", 3500);
        set("max_jing", 2800);
        set("neili", 4200);
        set("max_neili", 4200);
        set("jiali", 150);

        set("combat_exp", 1500000);

        set_skill("force", 200);
        set_skill("quanzhen-xinfa", 200);
        set_skill("xuanmen-neigong", 200);
        set_skill("sword", 180);
        set_skill("qixing-jian", 180);
        set_skill("dodge", 200);
        set_skill("tianshan-feidu", 200);
        set_skill("parry", 200);
        set_skill("strike", 180);
        set_skill("chongyang-shenzhang", 180);
        set_skill("finger", 180);
        set_skill("zhongnan-zhi", 180);
        set_skill("whip", 200);
        set_skill("tiangang-chenfa", 200);
        set_skill("literate", 180);
        set_skill("taoism", 180);
        set_skill("martial-cognize", 160);

        map_skill("force", "xuanmen-neigong");
        map_skill("sword", "qixing-jian");
        map_skill("dodge", "tianshan-feidu");
        map_skill("whip", "tiangang-chenfa");
        map_skill("parry", "tiangang-chenfa");
        map_skill("finger", "zhongnan-zhi");
        map_skill("strike", "chongyang-shenzhang");

        prepare_skill("finger", "zhongnan-zhi");
        prepare_skill("strike", "chongyang-shenzhang");

        create_family("全真教", 2, "弟子");

        set("inquiry", ([
                "朝拜天罡" : (: ask_skill1 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "whip.bai" :),
                (: perform_action, "finger.zhi" :),
                (: perform_action, "strike.lian" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }));

        setup();

        carry_object("/d/beijing/npc/obj/fuchen")->wield();
        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->query("gender") == "男性")
        {
                command("say 我不收男徒，你还是去拜我几位师兄为师吧。\n");
                return;
        }

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

        if (me->query("can_perform/tiangang-chenfa/bai"))
                return "这招我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫道素不相识，不知此话从何说起？";

        if (me->query_skill("tiangang-chenfa", 1) < 1)
                return "你连天罡尘法都没学，何谈绝招可言？";

        if (me->query("gongxian") < 150)
                return "你在我全真教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 10000)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("tiangang-chenfa", 1) < 120)
                return "你的天罡尘法不够娴熟，练高点再来吧。";

        if (me->query("max_neili") < 1500)
                return "你的内力修为不够，修炼高后再来找我吧。";

        message_sort(HIY "\n$n" HIY "微微一笑，忽地站起身，右手一抖，手"
                     "中拂尘顿时窜动不已，接连变幻了数种招式，分袭$N" HIY
                     "各处要害，招式煞为巧妙，令人叹为观止。\n\n" NOR,
                     me, this_object()); 

        command("nod");
        command("say 招式我都已经教你了，自己下去领悟吧。");
        tell_object(me, HIC "你学会了「朝拜天罡」。\n" NOR);
        if (me->can_improve_skill("whip"))
                me->improve_skill("whip", 1500000);
        if (me->can_improve_skill("tiangang-chenfa"))
                me->improve_skill("tiangang-chenfa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tiangang-chenfa/bai", 1);
        me->add("gongxian", -150);

        return 1;
}
