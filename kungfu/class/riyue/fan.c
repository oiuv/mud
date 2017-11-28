#include <ansi.h>
#include "riyue.h"

#define POYANG    "/clone/lonely/poyangfu"

inherit NPC;
inherit F_MASTER;

mixed ask_fu();
mixed ask_skill1();

void create()
{
	object ob;
        set_name("范松", ({"fan song", "fan", "song"}));
        set("nickname", HIR "大力神魔" NOR );
        set("title", "日月神教前辈长老");
        set("long", @LONG
大力神魔范松乃是日月神教的前辈长老，武功
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
        set_skill("hammer", 260);
        set_skill("pangu-qishi", 260);
        set_skill("club", 220);
        set_skill("jinyuan-gun", 220);
        set_skill("martial-cognize", 240);
        set_skill("literate", 180);

        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "tianhuan-shenjue");
        map_skill("hammer", "pangu-qishi");
        map_skill("club", "jinyuan-gun");
        map_skill("parry", "pangu-qishi");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

        create_family("日月神教", 7, "前辈长老");

        set_temp("apply/damage", 200);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        set("inquiry", ([
                "破阳神斧" : (: ask_fu :),
                "开天辟地" : (: ask_skill1 :),
        ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "hammer.kai" :),
                (: perform_action, "cuff.tong" :),
                (: perform_action, "claw.duan" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
	}) );

        setup();

        if (clonep())
        {
                ob = find_object(POYANG);
                if (! ob) ob = load_object(POYANG);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/d/heimuya/npc/obj/dafu");
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

        if (ob->query("family/master_id") != "ren woxing")
        {
                command("sneer");
                command("say 你还不配。");
                return -1; 
        }

        if ((int)ob->query("shen") > -80000)
        {
                command("hmm");
                command("say 老夫生平最痛恨的就是你这样的假仁假义之徒！");
                return -1;
        }

        if (skill != "hammer" && skill != "pangu-qishi")
        {
                command("hmm");
                command("say 我只传授你这套锤法，其余的找你师父学去。");
                return -1;
        }

        if (skill == "hammer" && ob->query_skill("hammer", 1) > 179)
        {
                command("say 你锤法的造诣已经非同凡响了，剩下就自己去练吧。");
                return -1;
        }

        if (ob->query("str") < 32)
        {
                command("say …唉…本来老夫可以传授你一套绝技。");
                command("say 可是怪你先天膂力太差，可惜啊…可惜……");
                return -1;
        }

        if (! ob->query_temp("can_learn/fansong"))
        {
                command("haha");
                command("say 想不到后辈中居然还有你这样的人物。");
                command("say 这套盘古七势乃本教神技，今日我就传授予你。");
                ob->set_temp("can_learn/fansong", 1);
        }
        return 1;
}

mixed ask_fu()
{
        object me;
        object ob;
        object owner;

        me = this_player();

        if (me->query("family/family_name") != "日月神教")
                return "给我滚开！";

        if (me->query("family/master_id") != "ren woxing")
                return "你还不配！";

        if (me->query("shen") > -100000)
                return "你这样心慈手软，拿了神斧又有什么用？";

        if (me->query_skill("pangu-qishi", 1) < 150)
                return "你连盘古七势都没学好，就算神兵在手又有何用？";

        ob = find_object(POYANG);
        if (! ob) ob = load_object(POYANG);
        owner = environment(ob);
        while (owner)
        {
                if (owner->is_character() || ! environment(owner))
                        break;
                owner = environment(owner);
        }

        if (owner == me)
                return "破阳神斧现在不就在你手里吗？";

        if (objectp(owner) && owner != this_object())
        {
                if (! owner->is_character())
                        return "你来晚了一步，破阳神斧我已经借出去了。";

                if (owner->query("family/family_name") == "日月神教")
                        return "老夫的破阳神斧现在是" + owner->query("name") +
                               "在用，你要用就去找他吧。";
                else
                        return "老夫的破阳神斧现在落入了" + owner->query("name") +
                               "之手，你去把它取回来吧！";
        }
        ob->move(this_object());

        command("say 既然这样，老夫这柄神斧你就拿去。");
        command("say 你用它多杀几个正派人士，扬扬咋们日月神教的威风。");
        command("give poyang fu to " + me->query("id"));

        ob = new("/d/heimuya/npc/obj/dafu");
        ob->move(this_object());
        ob->wield();
        return 1;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/pangu-qishi/kai"))
                return "这一招我不是已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("pangu-qishi", 1) < 1)
                return "你连盘古七势都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 1200)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -120000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 300)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("pangu-qishi", 1) < 180)
                return "你的盘古七势还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "朝$N" HIY "微微点了点头，说道：“看"
                     "好了！”说完$n" HIY "一声断喝，手中巨斧如山岳巍峙，"
                     "携着开天辟地之势猛劈而下，气势恢弘之极。顿时只听轰"
                     "然一声巨响，$n" HIY "面前的山壁已被劈出一道人来宽的"
                     "裂缝，威力之强，真可谓是惊天地，泣鬼神。直把$N" HIY
                     "看得目瞪口呆。\n\n" NOR, me, this_object()); 

        command("nod2");
        command("say 招式便是如此，你自己下去练吧。");
        tell_object(me, HIC "你学会了「开天辟地」。\n" NOR);
        if (me->can_improve_skill("hammer"))
                me->improve_skill("hammer", 1500000);
        if (me->can_improve_skill("pangu-qishi"))
                me->improve_skill("pangu-qishi", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/pangu-qishi/kai", 1);
        me->add("gongxian", -1200);

        return 1;
}
