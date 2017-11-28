#include <ansi.h>
#include "wudu.h"

#define DUJING  "/clone/lonely/book/dujing2"

inherit NPC;
inherit F_MASTER;
inherit F_COAGENT;

mixed ask_skill1();
mixed ask_skill2();
mixed ask_skill3();
mixed ask_me();

void create()
{
        set_name("齐云敖", ({ "qi yunao", "qi", "yunao" }));
        set("nickname", HIB "锦衣毒丐" NOR);
        set("long", @LONG
他就是五毒教的长老，人称锦衣毒丐的齐云
敖。乃是教主的同门师兄，在教中一向飞扬
跋扈，大权独揽。他长的身材魁梧，面目狰
狞，身穿一件五彩锦衣，太阳穴高高坟起。
LONG);
        set("title","五毒教长老");
        set("gender", "男性");
        set("age", 45);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 30);
        set("int", 40);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 4500);
        set("max_jing", 4000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 120);
        set("combat_exp", 1800000);
        set("score", 10000);

        set_skill("force", 220);
        set_skill("wudu-xinfa", 220);
        set_skill("xiuluo-yinshagong", 180);
        set_skill("dodge", 180);
        set_skill("jinshe-youshenbu", 180);
        set_skill("strike", 200);
        set_skill("tianchan-zhang", 200);
        set_skill("claw", 200);
        set_skill("wusheng-zhao", 200);
        set_skill("parry", 200);
        set_skill("sword", 200);
        set_skill("jinwu-goufa", 180);
        set_skill("whip", 180);
        set_skill("xiewei-bian", 180);
        set_skill("ruanhong-zhusuo", 180);
        set_skill("throwing", 180);
        set_skill("literate", 100);
        set_skill("poison", 250);
        set_skill("wudu-qishu", 250 );
        set_skill("martial-cognize", 200);

        set("no_teach", ([
                "xiuluo-yinshagong" : "要学修罗阴煞功找那贱人去。",
                "ruanhong-zhusuo"   : "这武功是由那贱人传授的，要学你找她去。",
        ]));

        map_skill("force", "xiuluo-yinshagong");
        map_skill("dodge", "jinshe-youshenbu");
        map_skill("strike", "tianchan-zhang");
        map_skill("claw", "wusheng-zhao");
        map_skill("parry", "wusheng-zhao");
        map_skill("sword", "jinwu-goufa");
        map_skill("whip", "ruanhong-zhusuo");
        map_skill("poison", "wudu-qishu");
        prepare_skill("strike", "tianchan-zhang");
        prepare_skill("claw", "wusheng-zhao");

        create_family("五毒教", 11, "长老");

        set("inquiry", ([
                "毒经"     : "你是要毒经上篇、中篇还是下篇？",
                "上篇"     :   "这个…毒经上篇你去问炼毒室的道人要吧。",
                "毒经上篇" : "这个…毒经上篇你去问炼毒室的道人要吧。",
                "中篇"     : (: ask_me :),
                "毒经中篇" : (: ask_me :),
                "下篇"     : "毒经下篇在教主手里，你去问她要吧。",
                "毒经下篇" : "毒经下篇在教主手里，你去问她要吧。",
                "腾蛇诀"   : (: ask_skill1 :),
                "毒蟾掌"   : (: ask_skill2 :),
                "夺命连环" : (: ask_skill3 :),
        ]));

        set("jinshe_count", 1);
        set("chat_chance", 2);
        set("chat_msg",({
                CYN "齐云敖怒道：这贱婢这样下去，本教三祖七子辛苦创下的基业"
                "都要毁在她手里了。\n" NOR,
                CYN "齐云敖自言自语道：我如能找到天下最厉害的毒圣，这教主之"
                "位就是我的了。\n" NOR,
                CYN "齐云敖自言自语道：唉…我应该上哪去找龙涎香呢？\n" NOR,
        }));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "claw.lian" :),
                (: perform_action, "strike.chan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/unarmed_damage", 200);
        set_temp("apply/armor", 200);

        setup();
        carry_object("/d/wudu/npc/obj/jinyi")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -1000)
        {
                command("say 我越看你越象六扇门派来的卧底。");
                return;
        }
        if ((int)ob->query("shen") > -15000)
        {
                command("say 你心慈手软，我是不会收你的！");
                return;
        }
        if ((int)ob->query("combat_exp") < 150000)
        {
                command("say 你还是先去增长点经验吧。");
                return;
        }
        if ((int)ob->query_skill("wudu-xinfa", 1) < 80)
        {
                command("say 你的五毒心法还学的不够啊。");
                return;
        }
        if ((int)ob->query_skill("wudu-qishu", 1) < 80)
        {
                command("say 我五毒教弟子以毒杀人，修习毒技是首要的。");
                command("say 你是否还应该多多钻研本门的绝学？");
                return;
        }

       command("nod");
       command("say 不错，不错。");
       command("recruit " + ob->query("id"));
       ob->set("title", "五毒教护法");
       return;
}

int accept_object(object who, object ob)
{
        object obn;

        if (! who || environment(who) != environment() ) return 0;
        if (! objectp(ob) ) return 0;
        if (! present(ob, who))
                return notify_fail("你没有这件东西。\n");

        if ( (string)ob->query("id") != "longxian xiang")
                return notify_fail(CYN "齐云敖摇头道：这些破烂东西给我有"
                                   "什么用？\n" NOR);

        message_vision(CYN "齐云敖见是龙涎香，大喜道：这…这…就是龙涎香"
                       "吗？真是太好了。\n" NOR, who);

        if (query("jinshe_count") < 1)
        {
              	command("sigh");
              	command("say 本来我该谢你点什么的，可手头实在拿不出东西来。");
              	return 1;
	} else
	{
        	obn = new("/d/wudu/obj/jinsheduye");
        	obn->move(who);
        	add("jinshe_count", -1);
                command("say 本长老不能白收你的东西，这是一瓶金蛇毒液，送给你吧。");
        	message_vision("$N拿出" YEL "金蛇毒液" NOR "(jinshe duye)给$n。\n",
                               this_object(), who);
              	return 1;
	}
}

mixed ask_skill1()
{
        object me;

        me = this_player();
        if (me->query("can_perform/xiewei-bian/tengshe"))
                return "你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们五毒教的人，何出此言？";

        if (me->query_skill("xiewei-bian", 1) < 1)
                return "你连蝎尾鞭都没学，还有什么绝招可言。";

        if (me->query("shen") > -20000)
                return "像你这样心慈手软，就算学了这招也干不了大事！";

        if (me->query("gongxian") < 100)
                return "你在教中所作的贡献还不够，这招我不忙传你。";

        if (me->query_skill("xiewei-bian", 1) < 100)
                return "你的蝎尾鞭还不到家，要多练练！";

        message_vision(HIY "$n" HIY "点了点头，在$N" HIY "耳边轻声"
                       "嘀咕了几句，又拔出腰间长\n索，凌空一个盘旋"
                       "，然后顺势一抖，鞭端猛的拔地而起，宛\n如活"
                       "蛇一般，颇为巧妙。\n" NOR, me,
                       this_object());
        command("nod");
        command("say 这招很简单，下去多练练便成！");
        tell_object(me, HIC "你学会了「腾蛇诀」。\n" NOR);
        if (me->can_improve_skill("whip"))
                me->improve_skill("whip", 1500000);
        if (me->can_improve_skill("xiewei-bian"))
                me->improve_skill("xiewei-bian", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xiewei-bian/tengshe", 1);
        me->add("gongxian", -100);
        return 1;
}

mixed ask_skill2()
{
        object me;

        me = this_player();
        if (me->query("can_perform/tianchan-zhang/chan"))
                return "你不是已经会了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们五毒教的人，何出此言？";

        if (me->query_skill("tianchan-zhang", 1) < 1)
                return "你连天蟾掌法都没学，何谈此言？";

        if (me->query("shen") > -35000)
                return "像你这样心慈手软，就算学了这招也干不了大事！";

        if (me->query("gongxian") < 200)
                return "你在教中所作的贡献还不够，这招我不忙传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不够，练不成这招！";

        if (me->query_skill("tianchan-zhang", 1) < 120)
                return "你的天蟾掌法还不到家，要多练练！";

        message_vision(HIY "$n" HIY "微微一笑，招手示意$N" HIY "他到跟"
                       "前，然后在$N" HIY "耳边轻声\n嘀咕了半天，$N" HIY
                       "直听得眉开眼笑，一边听一边点头。\n" NOR,
                       me, this_object());

        command("grin");
        command("say 用这招对付那些比你强的敌人…嘿…打中就跑，别死缠。");
        tell_object(me, HIC "你学会了「毒蟾掌」。\n" NOR);
        if (me->can_improve_skill("strike"))
                me->improve_skill("strike", 1500000);
        if (me->can_improve_skill("tianchan-zhang"))
                me->improve_skill("tianchan-zhang", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/tianchan-zhang/chan", 1);
        me->add("gongxian", -200);
        return 1;
}

mixed ask_skill3()
{
        object me;

        me = this_player();
        if (me->query("can_perform/wusheng-zhao/lian"))
                return "我不是已经教会你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return RANK_D->query_respect(me) + "不是我们五毒教的人，何出此言？";

        if (me->query_skill("wusheng-zhao", 1) < 1)
                return "你连五圣毒爪都没学，何谈此言？";

        if (me->query("shen") > -40000)
                return "像你这样心慈手软，就算学了这招也干不了大事！";

        if (me->query("gongxian") < 300)
                return "你在教中所作的贡献还不够，这招我不忙传你。";

        if (me->query_skill("force") < 150)
                return "你的内功火候不够，练不成这招！";

        if (me->query_skill("wusheng-zhao", 1) < 120)
                return "你的五圣毒爪还不到家，要多练练！";

        message_vision(HIY "$n" HIY "微微一笑，陡然探出五指，手出如风，抓"
                       "向$N" HIY "。$N" HIY "不\n由得大惊失色，急忙纵跃躲"
                       "闪，可$n" HIY "五指还是搭在了$N" HIY "\n的肩上。\n"
                       NOR, me, this_object());
        command("say 你懂了吗？");
        tell_object(me, HIC "你学会了「夺命连环」。\n" NOR);
        if (me->can_improve_skill("claw"))
                me->improve_skill("claw", 1500000);
        if (me->can_improve_skill("wusheng-zhao"))
                me->improve_skill("wusheng-zhao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/wusheng-zhao/lian", 1);
        me->add("gongxian", -300);
        return 1;
}

mixed ask_me()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "五毒教")
                return "你是哪里来的？跑来跟我罗嗦什么！";

        if (me->query("shen") > -10000)
                return "你是怎么搞的？连杀人都不会？";

        if (me->query("combat_exp") < 100000)
                return "你现在经验太浅，不用忙着去阅读毒经。";

        if (me->query_skill("poison", 1) > 119)
                return "你用毒的造诣已经不浅了，这毒经不看也罢。";

        ob = find_object(DUJING);
        if (! ob) ob = load_object(DUJING);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "不就是你拿着么？怎么反倒问我来了？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "…嗯…毒经中篇现在不在我手里。";

                if (owner->query("family/family_name") == "五毒教")
                        return "毒经现在是你同门" + owner->query("name") +
                               "在看，去找他吧。";
                else
                        return "我教的毒经现落在" + owner->query("name") +
                               "的手中，你去把它夺回来吧！";
        }
        ob->move(this_object());
        message_vision(CYN "$N" CYN "点头道：你拿去看吧，若有不解之处"
                       "可以来问我。\n" NOR, this_object(), me);
        command("give du jing2 to " + me->query("id"));
        return 1;
}