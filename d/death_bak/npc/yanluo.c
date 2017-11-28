#include <ansi.h>
inherit NPC;

mixed ask_quest();

void create()
{
        set_name("十殿阎罗", ({ "shidian yanluo", "shidian", "yanluo", "shi", "yan"}));
        set("long", "一位面如锅底，须若钢针，身穿红袍的大汉。\n"
                    "这就是阴间的十殿阎罗。\n");
        set("title", HIR "冥府地藏王殿前" NOR);
        set("nickname", HIY "阴司总管" NOR);
        set("gender", "男性");
        set("age", 3000);
        set("attitude", "friendly");
        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);

        set("max_qi", 30000);
        set("max_jing", 30000);
        set("neili", 50000);
        set("max_neili", 50000);
        set("jiali", 1000);

        set("combat_exp", 50000000);

        set_skill("unarmed", 1000);
        set_skill("finger", 1000);
        set_skill("claw", 1000);
        set_skill("strike", 1000);
        set_skill("hand", 1000);
        set_skill("cuff", 1000);
        set_skill("parry", 1000);
        set_skill("dodge", 1000);
        set_skill("force", 1000);
        set_skill("jiuyin-shengong", 1000);
        set_skill("magic", 1000);
        set_skill("literate", 1000);

        map_skill("parry", "jiuyin-shengong");
        map_skill("force", "jiuyin-shengong");
        map_skill("dodge", "jiuyin-shengong");
        map_skill("unarmed", "jiuyin-shengong");
        map_skill("finger", "jiuyin-shengong");
        map_skill("strike", "jiuyin-shengong");
        map_skill("hand", "jiuyin-shengong");
        map_skill("cuff", "jiuyin-shengong");
        map_skill("claw", "jiuyin-shengong");

        prepare_skill("claw", "jiuyin-shengong");
        prepare_skill("cuff", "jiuyin-shengong");

        set("chat_chance", 1);
        set("chat_msg",({
                CYN "十殿阎罗深深的叹了口气。\n" NOR,
                CYN "十殿阎罗叹道：玄武甲壳和朱雀羽毛还好点，可是青龙胆和白虎骨难弄啊……\n" NOR,
                CYN "十殿阎罗叹道：武甲、朱羽、龙胆还有虎骨，这可真难办啊。\n" NOR,
                CYN "十殿阎罗叹道：期限就要到了，地藏老大要我炼制的锁阳丹原料还没备齐，这可如何是好啊。\n" NOR,
                CYN "十殿阎罗叹道：地藏老大的任务可真是要命啊。\n" NOR,
                CYN "十殿阎罗抱怨道：平白无故的要什么锁阳丹，老大也真是的。\n" NOR,
        }));

        set("inquiry", ([
                "锁阳丹"   : (: ask_quest :),
                "炼制"     : (: ask_quest :),
                "炼丹"     : (: ask_quest :),
                "任务"     : (: ask_quest :),
                "交差"     : (: ask_quest :),
                "期限"     : (: ask_quest :),
                "原料"     : (: ask_quest :),
                "药引"     : (: ask_quest :),
                "地藏王"   : "他是这里的老大，没人惹得起他。",
                "龙胆"     : "龙胆就是神兽青龙的胆，凡人吃了可以平增功力，我也正需要一个来炼丹。",
                "青龙胆"   : "龙胆就是神兽青龙的胆，凡人吃了可以平增功力，我也正需要一个来炼丹。",
                "虎骨"     : "我正需要一根白虎的骨头来炼锁阳丹，怎么，你有么？",
                "白虎骨"   : "我正需要一根白虎的骨头来炼锁阳丹，怎么，你有么？",
                "朱雀羽毛" : "那东西本身是没什么用的，可却是我制作锁阳丹的原料。",
                "朱羽"     : "那东西本身是没什么用的，可却是我制作锁阳丹的原料。",
                "玄武甲壳" : "那壳用来铸盔甲倒是挺好，可难弄啊！我找了好久都没找到。",
                "武甲"     : "玄武甲壳用来铸盔甲倒是挺好，可难弄啊！我找了好久都没找到。",
                "甲壳"     : "玄武甲壳用来铸盔甲倒是挺好，可难弄啊！我找了好久都没找到。",
                "青龙"     : "神兽青龙有时候会在碧水寒潭出没，不过我去捉时却没见到。",
                "碧水寒潭" : "碧水寒潭就在奈河桥下面，你站在桥上往下跳就到了，不过你下去最好带上「地阴血脉」。",
                "地阴血脉" : "这东西可以在地府轮回司里寻找到。…嗯…要决是‘三三逢缘’。",
                "白虎"     : "那大虫就栖息在寂灭司后面的黑森林里，我派了好几个手下去捉它，结果全都挂了。",
                "黑森林"   : "黑森林里全是阴雾，除非有「指南车」，要不根本没法辨认方向。",
                "指南车"   : "那是黄帝流传下来的法宝之一，后来流落到了这里，不过我没见过。",
                "寂灭司"   : "寂灭司就在阎罗殿的东边。",
                "轮回司"   : "轮回司就在阎罗殿的东边。",
                "阎罗殿"   : "这个你也问我？你是笨死的啊？",
                "朱雀"     : "有人在阴阳塔顶见到过神兽朱雀，不过听说那扁毛畜生不落无宝之地，要寻它身上必须要带有宝物。",
                "宝物"     : "地府有个神石名曰「七色璎珞」，倒是个不得多见的宝物。",
                "七色璎珞" : "听传闻，这东西好象是落在了秦广王的手里。",
                "秦广王"   : "他和我一样，也是阴间十王之一。",
                "阴阳塔"   : "就是西边的那座塔，是地府里最高的建筑，平时由马面看守。",
                "马面"     : "和看守奈河桥的牛头一样，是地府的守卫。",
                "玄武"     : "那臭乌龟整年躲在血池地狱里吃死人肉，怎么弄都不出来。",
                "死人肉"   : "我操，这个你也问我？你去称两斤吃吃看就知道了。",
                "血池地狱" : "血池地狱就在阎罗殿的北边，你要下去必须得穿上「麒麟靴」。",
                "麒麟靴"   : "那是地藏王的东西，我也只瞧见过一次。",
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "finger.zhi" :),
                (: perform_action, "strike.zhang" :),
                (: perform_action, "cuff.quan" :),
                (: perform_action, "hand.shou" :),
                (: perform_action, "claw.zhua" :),
                (: exert_function, "recover" :),
                (: exert_function, "shield" :),
        }) );

        set("count", 1);
        create_family("阴司", 0, "总管");

        setup();
        carry_object(__DIR__"obj/cloth2")->wear();
}

mixed ask_quest()
{
        object ob;
        object me;
        me = this_player();

        if (me->query_temp("to_answer")) 
                return "你这人怎么这么罗嗦，到底干还是不干啊？";

        if (me->query("over_quest/hell_quest/锁阳丹"))
                return "上次的事情真是多谢谢你了。";

        if (me->query("hell_quest/锁阳丹"))
                return "我要的原料你都备齐了吗？你这人怎么这么罗嗦？";

        if ( ! me->is_ghost() && ! wizardp(me))
                return "咦？阳人怎么到这里来了？";

        if (query("over") > 1)
                return "东西我都已经准备好了，不需要你的帮忙了。";

        if (query("count") < 1)
                return "够了，我已经派人做去了。";

        if (me->query("combat_exp") < 1500000)
                return "……唉……你能力太低了，是帮不了我的。";

        message_vision(HIC "\n十殿阎罗仔细的打量了$N" HIC "好一阵。\n" NOR, me);
        command("say 不错，不错。");
        command("whisper " + me->query("id") + " 你是刚从阳间来的吧？看你的样子似乎"
                "武功不坏，能够帮我个忙吗？地藏\n王限我在今年内为他炼制锁阳丹，炼制这"
                "锁阳丹的千魂和万魄我已经准备齐了，可是尚差龙胆、虎骨、朱\n羽和玄武甲"
                "壳来做药引，你能帮我去弄吗？事成之后自然有你的好处。");

        remove_call_out("answer");
        call_out("answer", 2, me);
        me->set_temp("to_answer", 1);
        add_action("do_accept", "accept");
        return 1;
}

void answer(object me)
{
        tell_object(me, HIR "\n你愿意接受(accept)十殿阎罗的请求吗？\n" NOR);
}

int do_accept()
{
        object me = this_player();
        if (me->query_temp("to_answer")) 
        {
                tell_object(me, HIR "\n你决定帮助十殿阎罗寻找锁阳丹的"
                                "四种原料。\n" NOR);
                message_vision( CYN "\n十殿阎罗「哈哈哈」大笑几声。\n"
                                NOR, me);
                message_vision( CYN "十殿阎罗对$N" CYN "说道：那老夫就"
                                "多谢谢你了。\n"NOR, me);
                me->set("hell_quest/锁阳丹", 1);
                me->set("wang_get/龙胆", 1);
                me->set("wang_get/虎骨", 1);
                me->set("wang_get/朱羽", 1);
                me->set("wang_get/武甲", 1);
                me->delete_temp("to_answer", 1);
                remove_call_out("give_gold");
                call_out("give_gold", 2, me);
                add("count", -1);
        }
        return 1;
}

int give_gold(object me)
{
        message_vision(HIW "\n十殿阎罗随手一挥，登时变出一大堆金子，递"
                       "给$N" HIW "。\n"NOR, me);
        message_vision(CYN "十殿阎罗说道：你阳间的武器在这里召唤不回"
                       "来，这里的黄金足够你购买武具。\n"NOR, me);
        tell_object(me, HIC "\n你获得了一千两" NOR + YEL "黄金" NOR + 
                        HIC "。\n" NOR);
        MONEY_D->pay_player(me, 10000000);
        return 1;
}

int accept_object(object me, object ob)
{
        object obn;

        int exp, pot, mp;

        exp = 150000 + random(20000);
        pot = 5000 + random(5000);
        mp = 15 + random(10);

        if( !me || environment(me) != environment() ) return 0;
        if ( !objectp(ob) ) return 0;
        if ( !present(ob, me) ) return notify_fail("你没有这件东西。\n");

        if ( (string)ob->query("id") != "long dan"
          && (string)ob->query("id") != "hu gu"
          && (string)ob->query("id") != "zhu yu"
          && (string)ob->query("id") != "xuanwu jiake" )
        {
                message_vision(CYN "十殿阎罗摇了摇头，道：你给我这个干什么？\n" NOR, me);
                        return 0;
        }

        if (me->query("over_quest/hell_quest/锁阳丹"))
        {
                message_vision(CYN "十殿阎罗对$N" CYN "笑道：你已经替我备齐所有的原料"
                               "了，这个还是你留着自己用吧。\n" NOR, me);
                        return 0;
        }

        if (! me->query("hell_quest/锁阳丹"))
        {
                message_vision(CYN "十殿阎罗道：无功不受禄，这个你还是自己留着吧。\n"
                               NOR, me);
                        return 0;
        }

        if ( (string)ob->query("id") == "long dan" )
        {
                if ( me->query("over_quest/hell_quest/原料/虎骨")
                  && me->query("over_quest/hell_quest/原料/朱羽")
                  && me->query("over_quest/hell_quest/原料/武甲") )
                {
                        message_vision(HIW "十殿阎罗见是龙胆，大喜道：“这下四种原料都"
                                       "已备齐，终于可以开始炼制老大要的锁阳丹了！多"
                                       "亏有你的\n帮助啊，这个是以前我从蓬莱仙山得来"
                                       "的宝物，留着也没用，就当是酬劳好了。”\n"
                                       NOR, me);

                        me->add("combat_exp", exp);
                        me->add("potential", pot);
                        me->add("magic_points", mp);
                        if (me->query("potential") > me->query_potential_limit()) 
                                me->set("potential", me->query_potential_limit());

                        tell_object(me, HIR "\n你成功的为十殿阎罗备齐了锁阳丹原料。\n"
                                        NOR);

                        tell_object(me, HIC "\n你获得了一块" NOR + HIW "寰宇天晶" NOR +
                                        HIC "。\n"
                                        NOR);

                        tell_object(me, HIC "你获得了" + chinese_number(exp) + "点"
                                        "经验、" + chinese_number(pot) + "点潜能以"
                                        "及" + chinese_number(mp) + "点灵慧。\n" NOR);

                        me->set("over_quest/hell_quest/锁阳丹", 1);
                        me->delete("hell_quest/锁阳丹", 1);
                        me->delete("over_quest/hell_quest/原料/虎骨", 1);
                        me->delete("over_quest/hell_quest/原料/朱羽", 1);
                        me->delete("over_quest/hell_quest/原料/武甲", 1);
                        obn = new("/d/death/obj/tianjing");
                        obn->move(me);
                        destruct(ob);
                        add("over", 1);
                        return 1;
                }
           else {
                        if ( me->query("over_quest/hell_quest/原料/龙胆") )
                        {
                                message_vision( HIY "十殿阎罗见是龙胆，对$N" HIY "摇"
                                                "头道：龙胆你已经给过我了，你还是快去"
                                                "寻找其它原料吧。\n" NOR, me);
                                return 0;
                        }
                   else {
                                message("vision", HIY "十殿阎罗看见龙胆，大喜道：太好"
                                                  "了，这青龙胆到底还是让我得到了。\n"
                                                  NOR, environment(me));
                                me->set("over_quest/hell_quest/原料/龙胆", 1);
                                destruct(ob);
                                return 1;
                        }
                }
        }

        if ( (string)ob->query("id") == "hu gu" )
        {
                if ( me->query("over_quest/hell_quest/原料/龙胆")
                  && me->query("over_quest/hell_quest/原料/朱羽")
                  && me->query("over_quest/hell_quest/原料/武甲") )
                {
                        message_vision(HIW "十殿阎罗见是虎骨，大喜道：“这下四种原料都"
                                       "已备齐，终于可以开始炼制老大要的锁阳丹了！多"
                                       "亏有你的\n帮助啊，这个是以前我从蓬莱仙山得来"
                                       "的宝物，留着也没用，就当是酬劳好了。”\n"
                                       NOR, me);

                        me->add("combat_exp", exp);
                        me->add("potential", pot);
                        me->add("magic_points", mp);
                        if (me->query("potential") > me->query_potential_limit()) 
                                me->set("potential", me->query_potential_limit());

                        tell_object(me, HIR "\n你成功的为十殿阎罗备齐了锁阳丹原料。\n"
                                        NOR);

                        tell_object(me, HIC "\n你获得了一块" NOR + HIW "寰宇天晶" NOR +
                                        HIC "。\n"
                                        NOR);

                        tell_object(me, HIC "你获得了" + chinese_number(exp) + "点"
                                        "经验、" + chinese_number(pot) + "点潜能以"
                                        "及" + chinese_number(mp) + "点灵慧。\n" NOR);

                        me->set("over_quest/hell_quest/锁阳丹", 1);
                        me->delete("hell_quest/锁阳丹", 1);
                        me->delete("over_quest/hell_quest/原料/龙胆", 1);
                        me->delete("over_quest/hell_quest/原料/朱羽", 1);
                        me->delete("over_quest/hell_quest/原料/武甲", 1);
                        obn = new("/d/death/obj/tianjing");
                        obn->move(me);
                        destruct(ob);
                        add("over", 1);
                        return 1;
                }
           else {
                        if ( me->query("over_quest/hell_quest/原料/虎骨") )
                        {
                                message_vision( HIY "十殿阎罗见是虎骨，对$N" HIY "摇"
                                                "头道：虎骨你已经给过我了，你还是快去"
                                                "寻找其它原料吧。\n" NOR, me);
                                return 0;
                        }
                   else {
                                message("vision", HIY "十殿阎罗见是虎骨，大喜道：太好"
                                                  "了，那白虎再厉害还不是得乖乖的把骨"
                                                  "头送上来。\n"
                                                  NOR, environment(me));
                                me->set("over_quest/hell_quest/原料/虎骨", 1);
                                destruct(ob);
                                return 1;
                        }
                }
        }

        if ( (string)ob->query("id") == "zhu yu" )
        {
                if ( me->query("over_quest/hell_quest/原料/虎骨")
                  && me->query("over_quest/hell_quest/原料/龙胆")
                  && me->query("over_quest/hell_quest/原料/武甲") )
                {
                        message_vision(HIW "十殿阎罗见是朱羽，大喜道：“这下四种原料都"
                                       "已备齐，终于可以开始炼制老大要的锁阳丹了！多"
                                       "亏有你的\n帮助啊，这个是以前我从蓬莱仙山得来"
                                       "的宝物，留着也没用，就当是酬劳好了。”\n"
                                       NOR, me);

                        me->add("combat_exp", exp);
                        me->add("potential", pot);
                        me->add("magic_points", mp);
                        if (me->query("potential") > me->query_potential_limit()) 
                                me->set("potential", me->query_potential_limit());

                        tell_object(me, HIR "\n你成功的为十殿阎罗备齐了锁阳丹原料。\n"
                                        NOR);

                        tell_object(me, HIC "\n你获得了一块" NOR + HIW "寰宇天晶" NOR +
                                        HIC "。\n"
                                        NOR);

                        tell_object(me, HIC "你获得了" + chinese_number(exp) + "点"
                                        "经验、" + chinese_number(pot) + "点潜能以"
                                        "及" + chinese_number(mp) + "点灵慧。\n" NOR);

                        me->set("over_quest/hell_quest/锁阳丹", 1);
                        me->delete("hell_quest/锁阳丹", 1);
                        me->delete("over_quest/hell_quest/原料/虎骨", 1);
                        me->delete("over_quest/hell_quest/原料/龙胆", 1);
                        me->delete("over_quest/hell_quest/原料/武甲", 1);
                        obn = new("/d/death/obj/tianjing");
                        obn->move(me);
                        destruct(ob);
                        add("over", 1);
                        return 1;
                }
           else {
                        if ( me->query("over_quest/hell_quest/原料/朱羽") )
                        {
                                message_vision( HIY "十殿阎罗见是朱羽，对$N" HIY "摇"
                                                "头道：朱羽你已经给过我了，你还是快去"
                                                "寻找其它原料吧。\n" NOR, me);
                                return 0;
                        }
                   else {
                                message("vision", HIY "十殿阎罗看见朱羽，大喜道：不错，"
                                                  "不错。这的确是朱雀羽毛，真是谢谢你了。\n"
                                                  NOR, environment(me));
                                me->set("over_quest/hell_quest/原料/朱羽", 1);
                                destruct(ob);
                                return 1;
                        }
                }
        }

        if ( (string)ob->query("id") == "xuanwu jiake" )
        {
                if ( me->query("over_quest/hell_quest/原料/虎骨")
                  && me->query("over_quest/hell_quest/原料/龙胆")
                  && me->query("over_quest/hell_quest/原料/朱羽") )
                {
                        message_vision(HIW "十殿阎罗见是玄武甲壳，大喜道：“这下四种"
                                       "原料都已备齐，终于可以开始炼制老大要的锁阳丹"
                                       "了！多亏有\n你的帮助啊，这个是以前我从蓬莱仙"
                                       "山得来的宝物，留着也没用，就当是酬劳好了。”\n"
                                       NOR, me);

                        me->add("combat_exp", exp);
                        me->add("potential", pot);
                        me->add("magic_points", mp);
                        if (me->query("potential") > me->query_potential_limit()) 
                                me->set("potential", me->query_potential_limit());

                        tell_object(me, HIR "\n你成功的为十殿阎罗备齐了锁阳丹原料。\n"
                                        NOR);

                        tell_object(me, HIC "\n你获得了一块" NOR + HIW "寰宇天晶" NOR +
                                        HIC "。\n"
                                        NOR);

                        tell_object(me, HIC "你获得了" + chinese_number(exp) + "点"
                                        "经验、" + chinese_number(pot) + "点潜能以"
                                        "及" + chinese_number(mp) + "点灵慧。\n" NOR);

                        me->set("over_quest/hell_quest/锁阳丹", 1);
                        me->delete("hell_quest/锁阳丹", 1);
                        me->delete("over_quest/hell_quest/原料/虎骨", 1);
                        me->delete("over_quest/hell_quest/原料/龙胆", 1);
                        me->delete("over_quest/hell_quest/原料/朱羽", 1);
                        obn = new("/d/death/obj/tianjing");
                        obn->move(me);
                        destruct(ob);
                        add("over", 1);
                        return 1;
                }
           else {
                        if ( me->query("over_quest/hell_quest/原料/武甲") )
                        {
                                message_vision( HIY "十殿阎罗见是玄武甲壳，对$N" HIY "摇"
                                                "头道：这东西你已经给过我了，你还是快去"
                                                "寻找其它原料吧。\n" NOR, me);
                                return 0;
                        }
                   else {
                                message("vision", HIY "十殿阎罗看见玄武甲壳，大喜道：好！"
                                                  "太好了，那臭乌龟被你干掉了吧？\n"
                                                  NOR, environment(me));
                                me->set("over_quest/hell_quest/原料/武甲", 1);
                                destruct(ob);
                                return 1;
                        }
                }
        }

}

void attempt_apprentice(object ob)
{
        command("say 这里再怎么说也是侠客行底层改过来的，要拜地府玩西游记去。 ");
        return;
}
