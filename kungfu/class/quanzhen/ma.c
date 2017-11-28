#include <ansi.h>
#include "quanzhen.h"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;
inherit F_QUESTER;

mixed ask_skill1();

void create()
{
        set_name("马钰", ({ "ma yu", "ma", "yu" }));
        set("long", @LONG
他就是王重阳的大弟子，全真七子之首，丹阳
子马钰马真人。他慈眉善目，和蔼可亲，正笑
着看着你。
LONG);
        set("nickname", HIR "丹阳子" NOR);
        set("title", "全真七子");
        set("gender", "男性");
        set("age", 42);
        set("class", "taoist");
        set("shen_type",1);
        set("str", 32);
        set("int", 32);
        set("con", 32);
        set("dex", 32);
        set("max_qi", 5800);
        set("max_jing", 4500);
        set("neili", 6000);
        set("max_neili", 6000);
        set("jiali", 200);

        set("combat_exp", 2800000);

        set_skill("force", 260);
        set_skill("quanzhen-xinfa", 260);
        set_skill("xuanmen-neigong", 260);
        set_skill("sword", 240);
        set_skill("qixing-jian", 240);
        set_skill("quanzhen-jian", 240);
        set_skill("whip", 220);
        set_skill("tiangang-chenfa", 220);
        set_skill("dodge", 240);
        set_skill("tianshan-feidu", 240);
        set_skill("jinyan-gong", 240);
        set_skill("parry", 240);
        set_skill("jinguan-yusuo", 240);
        set_skill("strike", 240);
        set_skill("chongyang-shenzhang", 240);
        set_skill("haotian-zhang", 240);
        set_skill("hand", 240);
        set_skill("qixing-shou", 240);
        set_skill("finger", 240);
        set_skill("zhongnan-zhi", 240);
        set_skill("literate", 240);
        set_skill("taoism", 240);
        set_skill("martial-cognize", 240);

        map_skill("force", "xuanmen-neigong");
        map_skill("sword", "quanzhen-jian");
        map_skill("dodge", "jinyan-gong");
        map_skill("whip", "tiangang-chenfa");
        map_skill("parry", "jinguan-yusuo");
        map_skill("finger", "zhongnan-zhi");
        map_skill("hand", "qixing-shou");
        map_skill("strike", "haotian-zhang");

        prepare_skill("hand", "qixing-shou");
        prepare_skill("strike", "haotian-zhang");

        create_family("全真教", 2, "弟子");

        set("inquiry", ([
                "玄门金锁" : (: ask_skill1 :),
        ]));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.po" :),
                (: perform_action, "parry.suo" :),
                (: perform_action, "strike.ju" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();
        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query_skill("xuanmen-neigong", 1) < 120
           && (int)ob->query_skill("quanzhen-xinfa", 1) < 120)
        {
                command("say 你的本门内功心法火候不足，难以领略更高深的武功。");
                return;
        }

        if ((int)ob->query_skill("taoism", 1) < 120)
        {
                command("say 你在修身养性方面还需多加锻炼，等你道学心法够高后再来吧。");
                return;
        }

        if (ob->query("combat_exp") < 200000)
        {
                command("say 你的实战经验太差，看来难以领略更高深的武功。");
                return;
        }

        if ((int)ob->query("shen") < 30000)
        {
                command("say 行侠仗义是我辈学武人的宗旨，你这方面还做得不够。\n");
                return;
        }

        command("haha");
        command("say 不错，不错。念你如此有心，我就收下你。");
        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/jinguan-yusuo/suo"))
                return "这招我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "阁下与贫道素不相识，不知此话从何说起？";

        if (me->query_skill("jinguan-yusuo", 1) < 1)
                return "你连金关玉锁都没学，何谈绝招可言？";

        if (me->query("gongxian") < 400)
                return "你在我全真教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") < 50000)
                return "你的侠义正事还做得不够，这招我暂时还不能传你。";

        if (me->query_skill("jinguan-yusuo", 1) < 150)
                return "你的金关玉锁不够娴熟，练高点再来吧。";

        if (me->query_skill("force") < 200)
                return "你的内功修为不够，修炼高后再来找我吧。";

        message_sort(HIY "\n$n" HIY "点了点头，说道：“我给你演示一遍，可"
                     "看仔细了。”只听$n" HIY "话音刚落，顿时起身而立，双"
                     "手蓦的回圈，暗含天罡北斗星位，朝$N" HIY "攻去。霎时"
                     "$N" HIY "只觉招数一紧，接着双臂瘫软，全身力道竟似被"
                     "$n" HIY "锁住一般。\n\n" NOR, me, this_object()); 

        command("nod");
        command("say 这招看似简单，实却艰奥无比，你自行体会吧。");
        command("say 日后行走江湖，切记得饶人处且饶人，莫要积仇过深。");
        tell_object(me, HIC "你学会了「玄门金锁」。\n" NOR);
        if (me->can_improve_skill("parry"))
                me->improve_skill("parry", 1500000);
        if (me->can_improve_skill("jinguan-yusuo"))
                me->improve_skill("jinguan-yusuo", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jinguan-yusuo/suo", 1);
        me->add("gongxian", -400);

        return 1;
}

void unconcious()
{
        die();
}
