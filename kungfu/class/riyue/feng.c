#include <ansi.h>
#include "riyue.h"

#define SHENMU    "/clone/lonely/shenmu"

inherit NPC;
inherit F_MASTER;

mixed ask_back();
mixed ask_gun();
mixed ask_skill1();

void create()
{
	object ob;
        set_name("张乘风", ({"zhang chengfeng", "zhang", "chengfeng", "feng"}));
        set("nickname", HIY "金猴神魔" NOR );
        set("title", "日月神教前辈长老");
        set("long", @LONG
金猴神魔张乘风是日月神教的前辈长老，武功
高强，位尊无比。曾一度扫除五岳剑派联盟。
LONG);
        set("gender", "男性");
        set("class", "scholar");
        set("age", 61);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 36);
        set("int", 36);
        set("con", 36);
        set("dex", 36);
        
        set("max_qi", 5400);
        set("max_jing", 4000);
        set("neili", 7000);
        set("max_neili", 7000);
        set("jiali", 220);
        set("combat_exp", 3000000);
        set("score", 50000);

        set_skill("force", 260);
        set_skill("tianhuan-shenjue", 260);
        set_skill("riyue-xinfa", 220);
        set_skill("dodge", 220);
        set_skill("juechen-shenfa", 220);
        set_skill("cuff", 240);
        set_skill("zhenyu-quan", 240);
        set_skill("claw", 240);
        set_skill("poyue-zhao", 240);
        set_skill("parry", 240);
        set_skill("hammer", 220);
        set_skill("pangu-qishi", 220);
        set_skill("club", 260);
        set_skill("jinyuan-gun", 260);
        set_skill("martial-cognize", 240);
        set_skill("literate", 180);

        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "tianhuan-shenjue");
        map_skill("hammer", "pangu-qishi");
        map_skill("club", "jinyuan-gun");
        map_skill("parry", "jinyuan-gun");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

        create_family("日月神教", 7, "前辈长老");

        set_temp("apply/damage", 200);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        set("inquiry", ([
                "南海神木" : (: ask_gun :),
                "乾坤一击" : (: ask_skill1 :),
                "上崖" : (: ask_back :),
                "回崖" : (: ask_back :),
                "回去" : (: ask_back :),
        ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "club.qian" :),
                (: perform_action, "cuff.tong" :),
                (: perform_action, "claw.duan" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
	}) );

        setup();

        if (clonep())
        {
                ob = find_object(SHENMU);
                if (! ob) ob = load_object(SHENMU);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/d/heimuya/npc/obj/shutonggun");
                        ob->move(this_object());
                        ob->wield();
                }
        }
        carry_object("/d/heimuya/npc/obj/jinpao")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("say 走开，我不收徒。");
}

int recognize_apprentice(object ob, string skill)
{
        if (ob->query("family/family_name") != "日月神教")
        {
                command("killair");
                command("say 给我滚开，少在老夫面前说三道四！");
                return -1;
        }

        if (ob->query("family/master_id") != "ren woxing"
           && ob->query("family/master_id") != "xiang wentian")
        {
                command("sneer");
                command("say 你还不配。");
                return -1; 
        }

        if ((int)ob->query("shen") > -60000)
        {
                command("hmm");
                command("say 老夫生平最痛恨的就是你这样的假仁假义之徒！");
                return -1;
        }

        if (skill != "club" && skill != "jinyuan-gun")
        {
                command("hmm");
                command("say 我只传授你这套棍法，其余的找你师父学去。");
                return -1;
        }

        if (skill == "club" && ob->query_skill("club", 1) > 179)
        {
                command("say 你棍法的造诣已经非同凡响了，剩下就自己去练吧。");
                return -1;
        }

        if (! ob->query_temp("can_learn/zhangchengfeng"))
        {
                command("nod");
                command("say 念在你有心为本教出力，我就传你这套金猿棍法。");
                ob->set_temp("can_learn/zhangchengfeng", 1);
        }
        return 1;
}

mixed ask_gun()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "日月神教")
                return "给我滚开！";

        if (me->query("family/master_id") != "ren woxing"
           && me->query("family/master_id") != "xiang wentian")
                return "你还不配！";

        if (me->query("shen") > -80000)
                return "你这样心慈手软，拿了神木又有什么用？";

        if (me->query_skill("jinyuan-gun", 1) < 120)
                return "你连金猿棍法都没学好，就算神兵在手又有何用？";

        ob = find_object(SHENMU);
        if (! ob) ob = load_object(SHENMU);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "南海神木现在不就在你手里吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，南海神木我已经借出去了。";

                if (owner->query("family/family_name") == "日月神教")
                        return "老夫的南海神木现在是" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "老夫的南海神木现在落入了" + owner->query("name") +
                               "之手，你去把它取回来吧！";
        }
        ob->move(this_object());

        command("say 既然这样，老夫这根南海神木你就拿去。");
        command("say 你用它多杀几个正派人士，扬扬咋们日月神教的威风。");
        command("give nanhai shenmu to " + me->query("id"));

        ob = new("/d/heimuya/npc/obj/shutonggun");
        ob->move(this_object());
        ob->wield();
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/jinyuan-gun/qian"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("jinyuan-gun", 1) < 1)
                return "你连金猿棍法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 800)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -100000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 180)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("jinyuan-gun", 1) < 120)
                return "你的金猿棍法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "咳嗽一声，对$N" HIY "点了点头道：“看"
                     "好了！”说完便大步上前，怒吼一声，手中熟铜棍急速舞动"
                     "，霎时间飞沙走石，罡气激荡。便在那狂沙飓风中，$n" HIY
                     "忽然高高跃起，迎头一棒猛然劈落。数招一气呵成，连贯之"
                     "极，煞为壮观。\n\n" NOR, me, this_object()); 

        command("nod2");
        command("say 看懂了么？");
        tell_object(me, HIC "你学会了「乾坤一击」。\n" NOR);
        if (me->can_improve_skill("club"))
                me->improve_skill("club", 1500000);
        if (me->can_improve_skill("jinyuan-gun"))
                me->improve_skill("jinyuan-gun", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/jinyuan-gun/qian", 1);
        me->add("gongxian", -800);

        return 1;
}

mixed ask_back()
{
    	object me, myenv;
    	me = this_player();

        if (find_object(query("startroom")) != environment())
                return "咦？…嗯…这个…这…你还是自己看着办吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "他奶奶的，你找死么？";

        command("nod");
	message_vision(HIW "张乘风咳嗽一声，陡然纵声长啸，崖上顿时落下一个大吊篮。\n\n"
                       NOR + HIY "$N" HIY "一弯腰进了吊篮，吊篮缓缓地铰上崖去……\n\n", me);
        myenv = environment(me);
        me->move ("/d/heimuya/basket");
        me->start_call_out((: call_other, __FILE__, "up1", me :), 3);
        return 1;
}

void up1(object me)
{
    	tell_object(me, HIW "\n你乘座的吊篮急速上升，篮外的朵朵白云向下冲去。\n\n" NOR);
        me->start_call_out((: call_other, __FILE__, "up2", me :), 3);
}

void up2(object me)
{
    	tell_object(me, HIW "\n你眼前一亮，一幢幢白色建筑屹立眼前，霎是辉煌。\n\n" NOR);
        me->move("/d/heimuya/shanya3");
        message_vision(HIC "\n$N" HIC "乘坐吊篮上了黑木崖。\n\n" NOR, me);
}
