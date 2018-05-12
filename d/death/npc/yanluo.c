// Modified by Lonely

#include <ansi.h>
inherit NPC;

mixed ask_quest();
mixed ask_zhuan();

int check_status(object who);
int failed(object who);
int remove_all();
int winning(object who);
int message_ob(object who);
int round_1(object who);
int round_2(object who);
int round_3(object who);
int round_4(object who);
int round_5(object who);
int round_6(object who);
int round_7(object who);
int round_8(object who);
int round_9(object who);
int round_10(object who);
int round_11(object who);
int round_12(object who);
int round_13(object who);
int round_14(object who);
int round_15(object who);
int round_16(object who);
int round_17(object who);
int round_18(object who);

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
        set("jiali", 800);

        set("combat_exp", 100000000);

        set_skill("unarmed", 999);
        set_skill("finger", 999);
        set_skill("claw", 999);
        set_skill("strike", 999);
        set_skill("hand", 999);
        set_skill("cuff", 999);
        set_skill("parry", 999);
        set_skill("dodge", 999);
        set_skill("force", 999);
        set_skill("jiuyin-shengong", 999);
        set_skill("magic", 999);
        set_skill("literate", 999);

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
                "转世"     : (: ask_zhuan :),
                "name"     : "哼！连老夫都不认得，想来是活的太久了！\n",
                "here"     : "这便是阎罗地府，到阳间一谈，嘿嘿，没人不怕！\n",
                "阳间"     : "还阳容易，想不有损失就难了！\n",           
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
                "地阴血脉" : "这东西可以在地府轮回司里寻找到。…嗯…要诀是‘三三逢缘’。",
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
        //object ob;
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

        if (me->query("combat_exp") < 10000000)
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
                me->set("wang_get/虎皮", 1);
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

mixed ask_zhuan()
{
        object who;
        
        who = this_player();
        
        //限制只可转世一次 by 薪有所属
         if (who->query("reborn"))
        {
        	
                message_vision("$N对$n一拱手，道：你已经转世过一次了，每人只能转世一次。\n", 
                               this_object(), who);
                return 1;                
        }

        if ((int)who->query("combat_exp") < 20000000 || ! ultrap(who)) 
        {
                message_vision("$N对$n一拱手，道：经验不够，技能不熟，强求亦是枉然。\n", 
                               this_object(), who);
                return 1;
        }
        
        if (! who->query("animaout")) 
        {
                message_vision("$N对$n一拱手，道：你还没有修炼成元婴出世呢。\n", 
                               this_object(), who);
                return 1;
        }
        
        if (who->query("couple"))
        {
                message_vision("$N对$n一拱手，道：你还是先和你的家庭做个交代再转世吧。\n", 
                               this_object(), who);
                return 1;                
        }
                                
        if (who->query("bunch"))
        {
                message_vision("$N对$n一拱手，道：你还是先和你的帮派做个交代再转世吧。\n", 
                               this_object(), who);
                return 1;                
        }
                        
        if (who->query("brothers"))
        {
                message_vision("$N对$n一拱手，道：你还是先和你的结义兄弟做个交代再转世吧。\n", 
                               this_object(), who);
                return 1;                
        }                
        
        if (who->query("league"))
        {
                message_vision("$N对$n一拱手，道：你还是先和你的同盟做个交代再转世吧。\n", 
                               this_object(), who);
                return 1;                
        }
        
        if (! who->query("over_quest/hell_quest/锁阳丹"))
        {
                message_vision("$N对$n一拱手，道：你先帮我找到锁阳丹的药引，才能得到转世的机会。\n", 
                               this_object(), who);
                return 1;
        }                
   
        if (who->query("HellZhenPass")) 
        {
                message_vision("$N对$n一拱手，道：既是武功高强，我等佩服便是，这。。。便是免了吧！\n",
                               this_object(), who);
                return 1;
        }
        
        if (this_object()->query_temp("SomeonePassing")) 
        {
                message_vision("$N对$n一拱手，道：真时机缘不巧，改日再来吧。\n",
                               this_object(), who);
                return 1;
        }

        message_vision("$N对$n阴阴地笑了几声，说：天堂有路你不走，地狱无门你闯进来。\n",
                       this_object(), who);
                       
        this_object()->set_temp("SomeonePassing");

        message("channel:rumor", HIB "【阴曹地府】" + who->query("name") +
                "要闯俺幽冥地府十八层地狱，哼！等着收尸吧！\n" NOR, users());          

        message_vision("$N双手拍了一下，$n脚下突然陷了下去。。。\n", 
                       this_object(), who);
        who->delete("env/brief");
        who->move("/d/death/emptyroom");

        command("grin");
        this_object()->move("/clone/misc/void");
   
        call_out("message_ob", 2, who);
        call_out("round_1", 3, who);
        return 1;
}

int check_status(object who)
{
        if ((int)who->query("qi") < 500 ||
            (int)who->query("eff_qi") < 500) 
        {
                remove_call_out("round_2");
                remove_call_out("round_3");
                remove_call_out("round_4");
                remove_call_out("round_5");
                remove_call_out("round_6");
                remove_call_out("round_7");
                remove_call_out("round_8");
                remove_call_out("round_9");
                remove_call_out("round_10");
                remove_call_out("round_11");
                remove_call_out("round_12");
                remove_call_out("round_13");
                remove_call_out("round_14");
                remove_call_out("round_15");
                remove_call_out("round_16");
                remove_call_out("round_17");
                remove_call_out("round_18");
                remove_call_out("message_ob");
                remove_call_out("winning");
                call_out("failed", 1, who);
                return 1;
        }
}

int failed(object who)
{           
        message("channel:rumor", HIB "【阴曹地府】果真有不怕死的，可惜"
                "还是逃不出俺的手掌心！\n" NOR, users()); 
                
        this_object()->delete_temp("SomeonePassing");
        who->move("/clone/misc/void");
        who->unconcious();
        this_object()->move("/d/death/youmingdian");
        call_out("remove_all", 3);
        return 1;
}


int remove_all()
{   
        int i;
        object *list, empty;

        if (! (empty = find_object("/d/death/emptyroom")))
                empty = load_object("/d/death/emptyroom");
                
        write(HIB "四周刮起一阵阴风。。。\n" NOR);
        
        if (empty = find_object("/d/death/emptyroom")) 
        {
                list = all_inventory(empty);
                i = sizeof(list);
                while (i--)
                {
                        object ob=list[i];
                        ob->move("/d/city/wumiao");
                }
        }
        return 1;
}

int winning(object who)
{
        message("channel:rumor", HIB "【阴曹地府】恭喜" + who->query("name") +
                "闯过幽冥地府十八层地狱，不过更危险的在后面！\n" NOR, users());            
        who->set("HellZhenPass", 1);
        who->move("/d/death/yanluodian");
        this_object()->move("/d/death/youmingdian");
        this_object()->delete_temp("SomeonePassing");
        call_out("remove_all", 3);
        return 1;
} 

int message_ob(object who)
{
        switch(random(5)) 
        {
        case 0:
                tell_room(environment(who), "\n你觉得自己不断下降，周围景物如彩蝶翻飞，不可注目。\n");
                break;
        case 1:
                tell_room(environment(who), "\n你觉得自己不断下降。\n");
                break;
        case 2:
                tell_room(environment(who),"\n你觉得自己不断下降，天地似乎没了界限。。。\n");
                break;
        case 3:
                tell_room(environment(who),"\n你觉得自己不断下降，周围一切都在旋转。。。\n");
                break;
        case 4:
                tell_room(environment(who),"\n你觉得自己不断下降，下降，似乎落向了无尽的深渊。\n");
                break;
        }
        return 1;
}

int round_1(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/1");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),RED"                **************************************\n"NOR);
        tell_room(environment(who),RED"                **               吊筋狱             **\n"NOR);
        tell_room(environment(who),RED"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_2", 3, who);
        
        return 1;
}

int round_2(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/2");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),GRN"                **************************************\n"NOR);
        tell_room(environment(who),GRN"                **               幽枉狱             **\n"NOR);
        tell_room(environment(who),GRN"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_3", 3, who);
        
        return 1;
} 
int round_3(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/3");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),YEL"                **************************************\n"NOR);
        tell_room(environment(who),YEL"                **               火坊狱             **\n"NOR);
        tell_room(environment(who),YEL"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_4", 3, who);  
        
        return 1;
}
int round_4(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/4");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),BLU"                **************************************\n"NOR);
        tell_room(environment(who),BLU"                **               酆都狱             **\n"NOR);
        tell_room(environment(who),BLU"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_5", 3, who);
          
        return 1;
}
int round_5(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/5");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),MAG"                **************************************\n"NOR);
        tell_room(environment(who),MAG"                **               拔舌狱             **\n"NOR);
        tell_room(environment(who),MAG"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_6", 3, who);  
        
        return 1;
}
int round_6(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/6");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),CYN"                **************************************\n"NOR);
        tell_room(environment(who),CYN"                **               剥皮狱             **\n"NOR);
        tell_room(environment(who),CYN"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_7", 3, who);
          
        return 1;
}
int round_7(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/7"); 
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),HIR"                **************************************\n"NOR);
        tell_room(environment(who),HIR"                **               磨涯狱             **\n"NOR);
        tell_room(environment(who),HIR"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_8", 3, who);  
        return 1;
} 

int round_8(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/8");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),HIG"                **************************************\n"NOR);
        tell_room(environment(who),HIG"                **               锥捣狱             **\n"NOR);
        tell_room(environment(who),HIG"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_9", 3, who); 
         
        return 1;
}
int round_9(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/9");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),HIY"                **************************************\n"NOR);
        tell_room(environment(who),HIY"                **               车崩狱             **\n"NOR);
        tell_room(environment(who),HIY"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_10", 3, who);  
        
        return 1;
}
int round_10(object who)
{
        object ghost;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/10");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),HIB"                **************************************\n"NOR);
        tell_room(environment(who),HIB"                **               寒冰狱             **\n"NOR);
        tell_room(environment(who),HIB"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 2, who);
        call_out("round_11", 3, who);  
        
        return 1;
}

int round_11(object who)
{
        object ghost, ghostb;
        seteuid(getuid());
        
        ghostb = new("/d/death/HellZhen/15");
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/11");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),HIM"                **************************************\n"NOR);
        tell_room(environment(who),HIM"                **               脱壳狱             **\n"NOR);
        tell_room(environment(who),HIM"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        ghostb->move(environment(who));
        ghostb->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 4, who);
        call_out("round_12", 6, who);  
        
        return 1;
}
int round_12(object who)
{
        object ghost, ghostb;
        seteuid(getuid());
        
        ghostb = new("/d/death/HellZhen/11");
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/12");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),HIC"                **************************************\n"NOR);
        tell_room(environment(who),HIC"                **               抽肠狱             **\n"NOR);
        tell_room(environment(who),HIC"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        ghostb->move(environment(who));
        ghostb->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 4, who);
        call_out("round_13", 6, who); 
         
        return 1;
}
int round_13(object who)
{
        object ghost, ghostb;
        seteuid(getuid());
        
        ghostb = new("/d/death/HellZhen/16");
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/13");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),HIW"                **************************************\n"NOR);
        tell_room(environment(who),HIW"                **               油锅狱             **\n"NOR);
        tell_room(environment(who),HIW"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        ghostb->move(environment(who));
        ghostb->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 4, who);
        call_out("round_14", 6, who);  
        
        return 1;
}
int round_14(object who)
{
        object ghost, ghostb;
        seteuid(getuid());
        
        ghostb = new("/d/death/HellZhen/18");
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/14");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),RED"                **************************************\n"NOR);
        tell_room(environment(who),RED"                **               黑暗狱             **\n"NOR);
        tell_room(environment(who),RED"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        ghostb->move(environment(who));
        ghostb->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 4, who);
        call_out("round_15", 6, who);  
        
        return 1;
}
int round_15(object who)
{
        object ghost, ghostb;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/15");
        seteuid(getuid());
        
        ghostb = new("/d/death/HellZhen/14");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),GRN"                **************************************\n"NOR);
        tell_room(environment(who),GRN"                **               刀山狱             **\n"NOR);
        tell_room(environment(who),GRN"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        ghostb->move(environment(who));
        ghostb->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 4, who);
        call_out("round_16", 6, who);  
        
        return 1;
}


int round_16(object who)
{
        object ghost, ghostb;
        seteuid(getuid());
        
        ghostb = new("/d/death/HellZhen/15");
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/16");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),YEL"                **************************************\n"NOR);
        tell_room(environment(who),YEL"                **               血池狱             **\n"NOR);
        tell_room(environment(who),YEL"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        ghostb->move(environment(who));
        ghostb->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 4, who);
        call_out("round_17", 6, who);  
        
        return 1;
}
int round_17(object who)
{
        object ghost, ghostb;
        seteuid(getuid());
        
        ghostb = new("/d/death/HellZhen/16");
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/17");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),BLU"                **************************************\n"NOR);
        tell_room(environment(who),BLU"                **               阿鼻狱             **\n"NOR);
        tell_room(environment(who),BLU"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        ghostb->move(environment(who));
        ghostb->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("message_ob", 4, who);
        call_out("round_18", 6, who); 
         
        return 1;
}
int round_18(object who)
{
        object ghost, ghostb;
        seteuid(getuid());
        
        ghost = new("/d/death/HellZhen/18");
        seteuid(getuid());
        
        ghostb = new("/d/death/HellZhen/17");
        
        tell_room(environment(who),"\n突然间一道黑牌闪过：\n\n");
        tell_room(environment(who),CYN"                **************************************\n"NOR);
        tell_room(environment(who),CYN"                **               秤杆狱             **\n"NOR);
        tell_room(environment(who),CYN"                **************************************\n"NOR);
        
        ghost->move(environment(who));
        ghost->invocation(who);
        
        ghostb->move(environment(who));
        ghostb->invocation(who);
        
        call_out("check_status", 1, who);
        call_out("winning", 3, who); 
         
        return 1;
}
