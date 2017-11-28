#include <ansi.h>
inherit ROOM;

#define JIASHA    "/clone/lonely/book/kuihua1"

void create()
{
        set("short", "山崖");
        set("long", @LONG
这是华山后山的陡峭山崖，做上方便是华山派掌门岳不群的居室，居
室的窗户正对着你的头顶。
LONG);
        set("exits",([
                "east" : __DIR__"songlin4",
        ]));
        setup();
}

void init()
{
        object me = this_player(), ob;

        ob = find_object(JIASHA);
        if (! ob) ob = load_object(JIASHA);

        add_action("do_look", "view");
       	add_action("do_look", "wang");

        if (! environment(ob) &&
	    ! query("begin") &&
            ! query("over") &&
            me->query("gender") == "无性")
        {
		set("jiasha", 1);
                tell_object(me, HIB "你刚到这里，忽然听见上方窗户传来阵阵耳"
                                "语，不禁想朝窗户望(view)去！\n" NOR);
        }
        return 0;
}

int do_look(string arg)
{
        object me = this_player();

        if (arg != "window" && arg != "chuanghu" && arg != "chuang")
                return notify_fail("你要看什么？\n");

        if (query("over") || ! query("jiasha"))
                return notify_fail("一扇紧闭着的窗户，没什么好瞧的。\n");

        if (query("begin"))
                return notify_fail("窗户里两个人影正在谈话，要偷听就别动。\n");

        if (me->query("gender") != "无性")
                return notify_fail("一扇紧闭着的窗户，没什么好瞧的。\n");

        message_vision(HIB "$N" HIB "望窗户瞧去，只见窗前立着两个淡淡的人影，正在"
                       "低声细语，$N" HIB "忍耐不住好奇，悄悄\n的走到窗前偷听两人"
                       "的对话。\n" NOR,me);
        remove_call_out("do_talk1");
        call_out("do_talk1", 4, me);
        set("begin", 1);
        me->start_busy(43);
        return 1;
}

int do_talk1(object me)
{
        message_vision( WHT "\n只听得一位女子的声音说道：“师哥，我觉得你近来神色"
                        "不对，是不是练那紫霞神功有\n些儿麻烦？可别太求精进，惹出"
                        "乱子来。”听声音似乎是华山掌门夫人宁中则。\n" NOR, me);
        remove_call_out("do_talk2");
        call_out("do_talk2", 4, me);
        return 1;
}

int do_talk2(object me)
{
        message_vision( WHT "\n又听得一位尖声尖气的声音说道：“没有啊，我练功顺利"
                        "得很。”那声音依稀便是华山\n的掌门岳不群，你不竟大吃一惊"
                        "。\n" NOR, me);
        remove_call_out("do_talk3");
        call_out("do_talk3", 4, me);
        return 1;
}

int do_talk3(object me)
{
        message_vision( WHT "\n那女子又道：“你别瞒我，为甚么你近来说话的嗓子变了"
                        "，又尖又高，倒像女人似的。”\n" NOR, me);
        remove_call_out("do_talk4");
        call_out("do_talk4", 4, me);
        return 1;
}

int do_talk4(object me)
{
        message_vision( WHT "\n那男子怒道：“胡说八道！我说话向来就是这样的。”\n"
                        NOR, me);
        remove_call_out("do_talk5");
        call_out("do_talk5", 4, me);
        return 1;
}

int do_talk5(object me)
{
        message_vision( HIB "\n你听得那男子说这句话，嗓声果然相当尖，确像是个女子"
                        "在大发脾气。\n" NOR, me);
        remove_call_out("do_talk6");
        call_out("do_talk6", 4, me);
        return 1;
}

int do_talk6(object me)
{
        message_vision( WHT "\n那女子接着说道：“还说没变？你一生之中，就从来没对"
                        "我这样说过话。我俩夫妇多年，\n你心中有甚么解不开的事，何"
                        "以瞒我？”\n" NOR, me);
        remove_call_out("do_talk7");
        call_out("do_talk7", 4, me);
        return 1;
}

int do_talk7(object me)
{
        message_vision( WHT "\n那男子又道：“有甚么解不开的事？嗯，嵩山之会不远，"
                        "左冷禅意图吞并四派，其心昭\n然若揭。我为此烦心，那也是有"
                        "的。”\n" NOR,me);
        remove_call_out("do_talk8");
        call_out("do_talk8", 4, me);
        return 1;
}

int do_talk8(object me)
{
        message_vision( WHT "\n那女子哼了一声，道：“我看还不止于此。”\n" NOR, me);
        remove_call_out("do_talk9");
        call_out("do_talk9", 4, me);
        return 1;
}

int do_talk9(object me)
{
        message_vision( WHT "\n那男子尖声道：“你便是瞎疑心，此外更有甚么？”\n"
                        NOR, me);
        remove_call_out("do_talk10");
        call_out("do_talk10", 4, me);
        return 1;
}

int do_talk10(object me)
{
        message_vision( WHT "\n那女子声音十分平静，说道：“我说了出来，你可别发火"
                        "。我知道你是冤枉了冲儿。那\n日冲儿受伤昏迷，我替他止血治"
                        "伤之时，见到他身上有件袈裟，写满了字，似乎是剑法\n之类。"
                        "第二次替他换药，那件袈裟已经不见了，其时冲儿仍然昏迷未醒"
                        "。这段时候之中，\n除了你我二人，并无别人进房。这件袈裟可"
                        "不是我拿的。”\n" NOR, me);
        remove_call_out("do_talk11");
        call_out("do_talk11", 6, me);
        return 1;
}

int do_talk11(object me)
{
        message_vision( WHT "\n那男子几次插口说话，但均只含糊不清的说了一两个字，"
                        "便没再说下去……\n" NOR, me);
        remove_call_out("do_talk12");
        call_out("do_talk12", 4, me);
        return 1;
}

int do_talk12(object me)
{
        message_vision( WHT "\n那女子语声渐转柔和，说道：“师哥，我华山一派的剑术"
                        "，自有独到的造诣，紫霞神功\n的气功更是不凡，以此与人争雄"
                        "，自亦足以树名声于江湖，原不必再去另学别派剑术。\n只是近"
                        "来左冷禅野心大炽，图并四派。华山一派在你手里，说甚么也不"
                        "能沦亡于他的手\n中。咱们再联络了泰山、恒山、衡山三派，到"
                        "时以四派斗他一派，我看还是占了六成赢\n面，就算真的不胜，"
                        "大伙儿轰轰烈烈的剧斗一场，将性命送在嵩山，也就是了，到了"
                        "九\n泉之下也不致愧对华山派的列祖列宗。”\n" NOR, me);
        remove_call_out("do_talk13");
        call_out("do_talk13", 6, me);
        return 1;
}

int do_talk13(object me)
{
        message_vision( WHT "\n那男子大声道：“你怎知我在学辟邪剑法？你……你……"
                        "在偷看我吗？”\n" NOR, me);
        remove_call_out("do_talk14");
        call_out("do_talk14", 4, me);
        return 1;
}

int do_talk14(object me)
{
        message_vision( WHT "\n那女子说道：“我又何必偷看这才知道？你说话的声音，"
                        "就已经全然变了，人人都听得\n出来，难道你自己反而不觉得？"
                        "每天早晨，你被窝里总是落下了许多胡须……”\n" NOR, me);
        remove_call_out("do_talk15");
        call_out("do_talk15", 4, me);
        return 1;
}

int do_talk15(object me)
{
        message_vision( WHT "\n那男子尖叫一声，问道：“你瞧见了？语音甚是惊怖。”"
                        "\n" NOR, me);
        remove_call_out("do_talk16");
        call_out("do_talk16", 4, me);
        return 1;
}

int do_talk16(object me)
{
        message_vision( WHT "\n那女子叹道：“我早瞧见了，一直不说。你粘的假须，能"
                        "瞒过旁人，却怎瞒得过和你做\n了几十年夫妻的枕边之人？”\n"
                        NOR,me);
        remove_call_out("do_talk17");
        call_out("do_talk17", 4, me);
        return 1;
}

int do_talk17(object me)
{
        message_vision( WHT "\n那男子见事已败露，无可再辩，隔了良久，问道：“旁人"
                        "还有谁知道了？”\n" NOR, me);
        remove_call_out("do_talk18");
        call_out("do_talk18", 4, me);
        return 1;
}

int do_talk18(object me)
{
        message_vision( WHT "\n那女子说道：“没有，珊儿和平之也不知道”\n" NOR, me);
        remove_call_out("do_talk19");
        call_out("do_talk19", 4, me);
        return 1;
}

int do_talk19(object me)
{
        message_vision( WHT "\n那男子沉吟片刻，说道：“好，我听你的劝，这件袈裟，"
                        "我立即毁去，再慢慢想法替令\n狐冲洗刷清白。这路剑法，今后"
                        "也不练了。”\n" NOR, me);
        remove_call_out("do_talk20");
        call_out("do_talk20", 4, me);
        return 1;
}

int do_talk20(object me)
{
        object ob;
        int exp, pot, sc;

        exp = 10000 + random(3000);
        pot = 1000 + random(300);
        sc = 20 + random(30);

        ob = find_object(JIASHA);
        if (! ob) ob = load_object(JIASHA);

        if (! environment(ob))
	{
        	message_vision( HIR "\n$N" HIR "大吃一惊，便想出声阻止，剑谱乃不世之物，"
                               "管他有益有害，岳老贼可无权毁去。便\n在此时，只听得窗子呀"
                               "的一声打开，$N" HIR "急忙缩头，眼前红光一闪，那件袈裟飘"
                               "将了下来，\n跟着窗子又即关上。眼看那袈裟从身旁飘过，$N" HIR
                               "伸手一抓，差了数尺，没能抓到。顿时\n$N" HIR "将生死置之"
                               "度外，右手搭在崖上，左脚拚命向外一勾，只觉脚尖似乎碰到了"
                               "袈裟，立\n即缩将回来，当真幸运得紧，竟将那袈裟勾到了，没"
                               "落入天声峡下的万仞深渊中。\n\n" NOR, me);
	        set("over", 1);
        	delete_temp("jiasha");
	        ob->move(me, 1);

                if (! (int)me->query("skybook/xiaoao/baodian"))
                {
                        me->add("combat_exp", exp);
                        me->add("potential", pot);
                        me->add("score", sc);
                        tell_object(me, HIW "你成功的取得了葵花宝典！\n" NOR + HIC "通"
                                        "过这次的历练，你获得了" + chinese_number(exp) +
                                        "点经验、" + chinese_number(pot) + "点潜\n能以及"
                                        + chinese_number(sc) + "点江湖阅历。\n\n" NOR);
                        me->set("skybook/xiaoao/baodian", 1);
                } else
        	        tell_object(me, HIC "你得到了一件袈裟。\n\n" NOR);
	} else
	{
        	message_vision( HIR "\n$N" HIR "大吃一惊，便想出声阻止，剑谱乃不世之物，"
                               "管他有益有害，岳老贼可无权毁去。便\n在此时，只听得窗子呀"
                               "的一声打开，$N" HIR "急忙缩头，眼前红光一闪，那件袈裟飘"
                               "将了下来，\n跟着窗子又即关上。眼看那袈裟从身旁飘过，$N" HIR
                               "伸手一抓，差了数尺，没能抓到。袈裟\n顿时落入天声峡下的万"
                               "仞深渊中。\n\n" NOR, me);
	        set("over", 1);
        	delete_temp("jiasha");
	}
        return 1;
}
