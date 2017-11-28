#include <ansi.h>
#include "honghua.h"

#define HUILONGBI    "/clone/lonely/huilongbi"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_bi();
mixed ask_skill1();

void create()
{
        object ob;
        set_name("赵半山", ({"zhao banshan", "zhao", "banshan"}));
        set("title", "红花会三当家");
        set("nickname", HIY "千臂如来" NOR );
        set("gender", "男性");
        set("age", 48);
        set("long", "只见他一张胖胖的脸，笑起来给人一副很慈\n"
                    "祥的感觉。他原是温州王氏太极门掌门大弟\n"
                    "子。豪迈豁达，行侠江湖，一手暗器功夫和\n"
                    "太极剑少有能匹敌。屠龙帮风流云散之后，\n"
                    "投入红花会。很得被红花会老当家于万亭赏\n"
                    "识。\n");
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("per", 21);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 4500);
        set("max_qi", 4500);
        set("jing", 3000);
        set("max_jing", 3000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 150);
        set("combat_exp", 3000000);
        set("score", 10000);

        set_skill("force", 220);
        set_skill("honghua-xinfa", 220);
        set_skill("tianchi-neigong", 220);
        set_skill("unarmed", 220);
        set_skill("dodge", 220);
        set_skill("yanzi-chuanyun", 220);
        set_skill("taiji-jian", 220);
        set_skill("taiji-quan", 220);
        set_skill("parry", 220);
        set_skill("sword", 220);
        set_skill("throwing", 240);
        set_skill("huilong-bifa", 240);
        set_skill("martial-cognize", 200);
        set_skill("literate", 200);

        set("no_teach", ([
                "taiji-jian" : "嗯……你还是学点其它的吧。",
                "taiji-quan" : "嗯……你还是学点其它的吧。",
        ]));

        map_skill("force"   , "tianchi-neigong");
        map_skill("unarmed" , "taiji-quan");
        map_skill("dodge"   , "yanzi-chuanyun");
        map_skill("parry"   , "taiji-jian");
        map_skill("sword"   , "taiji-jian");
        map_skill("throwing", "huilong-bifa");

        create_family("红花会", 4, "当家");

        set("inquiry", ([
                "回龙璧" : (: ask_bi :),
                "掌藏龙" : (: ask_skill1 :),
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.chan" :),
                (: perform_action, "throwing.cang" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );
        setup();

        if (clonep())
        {
                ob = find_object(HUILONGBI);
                if (! ob) ob = load_object(HUILONGBI);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        set_temp("handing", ob);
                } else
                {
                        set_temp("handing", carry_object("/d/beijing/npc/obj/jinbiao"));
                }
        }
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/greyrobe")->wear();
    
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if ((int)me->query("shen") < 15000)
        {
                command("say 你侠义之事做得太少，需要多多注意。");
                return;
        }

        if ((int)me->query("combat_exp") < 200000)
        {
                command("say 你的江湖经验太浅，还是先跟着其它几位当家练练吧。");
                return;
        }

        if ((int)me->query_skill("honghua-xinfa", 1) < 80)
        {
                command("say 你下去把本门的心法练好了再来找我。");
                return;
        }

        command("smile");
        command("say 念在你如此有心，我便收下你好了。");
        command("recruit " + me->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/huilong-bifa/cang"))
                return "这招我不是早传授给你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "和本教素无瓜葛，何出此言？";

        if (me->query_skill("huilong-bifa", 1) < 1)
                return "你连回龙璧法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 600)
                return "你在会中所作的贡献还不够，这招我不忙传你。";

        if (me->query("shen") < 30000)
                return "你侠义正事做得不够，这招我不能传你。";

        if (me->query_skill("force") < 160)
                return "你的内功火候不足，学不成这一招。";

        if (me->query_skill("huilong-bifa", 1) < 120)
                return "你的回龙璧法还练得不到家，自己下去练练再来吧！";

        message_vision(HIY "$n" HIY "哈哈一笑，将$N" HIY "招至跟前，轻"
                       "声在耳旁秘密说了些什么。随后又伸出右\n手，十指"
                       "箕张，一伸一缩，看样子是一种很特别的暗器法门。\n"
                       NOR, me, this_object());

        command("haha");
        command("say 听清楚了吗，自己下去练吧。");
        tell_object(me, HIC "你学会了「掌藏龙」。\n" NOR);

        if (me->can_improve_skill("throwing"))
                me->improve_skill("throwing", 1500000);
        if (me->can_improve_skill("huilong-bifa"))
                me->improve_skill("huilong-bifa", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/huilong-bifa/cang", 1);
        me->add("gongxian", -600);

        return 1;
}

mixed ask_bi()
{
        object me;
        object ob;

        me = this_player();

        if (me->query("family/family_name") != "红花会")
                return "嘿，你是哪里来的？我可不认识你。";

        if (me->query("family/master_id") != "chen jialuo" &&
           me->query("family/master_id") != "wuchen daozhang" &&
           me->query("family/master_id") != "zhao banshan")
                return "这个…你师父" + me->query("family/master_name") + CYN
                       "说了，不能太宠着你，过些日子吧。";

        if (me->query_skill("huilong-bifa", 1) < 150)
                return "等你回龙璧法练成后再来找我，快下去练练。";

        if (me->query("shen") < 30000)
                return "哎呀呀，我这倒不是吝啬，可是你的德行也……";

        if (present("huilong bi", me))
                return "我的回龙璧不正是你拿着在用吗，为何还反倒问起我来了？";

        ob = present("huilong bi", this_object());

        if (! objectp(ob))
                return "你来晚了，回龙璧现在并不在我手中。";

        message_vision("$N拿出" HIC "回龙璧" NOR "(Huilong bi)给$n。\n",
                       this_object(), me);
        ob->move(me, 1);
        set_temp("handing", carry_object("/d/beijing/npc/obj/jinbiao"));

        return "既然这样，我这支回龙璧你就暂时拿去用吧。";
}
