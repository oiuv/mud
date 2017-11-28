#include <weapon.h>
#include <ansi.h>

#define RAGE "「" HIR "馬拉馮之怒" NOR "」"
#define RAGEC "「" HIR "馬拉馮之怒" NOR

#define SHIELD "「" HIB "洛山達高等護盾" NOR "」"
#define SHIELDC "「" HIB "洛山達高等護盾" NOR

string look_sword();
void remove_effect(object me, int amount);

inherit SWORD;

void create()
{
        set_name(HIY "神聖長劍" NOR, ({ "long sword", "sword" }));
        set_weight(1000);
        if (clonep())
                destruct(this_object());
        else {
                set("unit", "柄");
                set("no_sell", 1);
                set("long", (: look_sword :));
                set("value", 2000000);
                set("no_sell", "Oh！My god！");
                set("material", "???");
                set("stable", 100);
        }
        init_sword(500);
        setup();
}

void init()
{
        add_action("do_cast", "cast");
}

string look_sword()
{
        return HIY
        "\n"
        "神聖長劍+5：「" HIR "諸神的喧譁" HIY "」\n\n"
        "這把長劍除了柄端由白銀所鑄外，整個劍身漆黑，無鋒無刃，便似薄\n"
        "鐵片般。但是當你的指尖觸碰到劍身時，能感到一絲刺骨的冰涼，這\n"
        "時甚至會發覺它是有心跳的。諸神的喧譁鑄造於1039 DR ，鑄造者是\n"
        "愛爾吉德的一位高階牧師，當時愛爾吉德受到半獸人的圍剿長達三年\n"
        "之久，运輸物資的道路被切斷，戰士和人們由於長期得不到補給，大\n"
        "都士氣低落，而斯洛塔神廟的牧師在戰役中卻擔任了救援和醫療的工\n"
        "作，同時牧師們也在不停地向諸神祈祷，以求保佑平安。盡管人們虔\n"
        "诚的信奉著諸神，等待上天給與幫助，但愛爾吉德仍於1042 DR 被半\n"
        "獸人攻佔，同時斯洛塔神廟成了一片廢墟，這把劍也不知所蹤。\n\n"
        "黑傑克·勞倫斯是一位墮落的聖武士，在撒丁亞城素以冷酷和勇猛著\n"
        "稱，人們稱他是「雙刃手」，卻不知他的很大一部分能力是來自於他\n"
        "的配劍。一次在撒丁亞城的酒吧中，一位喝醉的矮人盜贼不滿他的稱\n"
        "號，向他發出了挑戰。雖然黑傑克·勞倫斯英勇善戰，也手刃了這位\n"
        "狂妄的矮人盜贼，但他仍然敵不過前來幫忙的大群紅武士集團的雇佣\n"
        "兵，被分成了七塊。而這把劍也被佣兵頭領當作戰利品取走。\n\n" NOR
        "數據資料：\n"
        "傷害力：" WHT "1d10+5，對善良或是邪惡陣營的敵人時獲得+10改善\n" NOR
        "零級命中值：" WHT "獲得+7改善\n" NOR
        "傷害類型：" WHT "揮砍\n" NOR
        "抗力加值：\n" WHT
        "  +15%魔法抗力\n"
        "  +50%寒冷抗力\n"
        "  對噴吐攻擊的豁免率檢定+10有利\n" NOR
        "特殊功能：\n" WHT
        "  每天施展一次馬拉馮之怒\n"
        "  每天施展兩次洛山達高等護盾\n"
        "  每天施展三次英雄氣概\n"
        "  持用者對死亡一指/律令：死亡/狂暴魅惑/恐懼之袍/無助法印免疫\n"
        "  擊中目標後有15%機會將目標震昏，爲時10輪\n"
        "  擊中目標後有50%機會以持用者為中心發出一個3d6的火球\n" NOR
        "重量：" WHT "10\n" NOR
        "使用速度：" WHT "1\n" NOR
        "武器特長類別：" WHT "大型劍\n" NOR
        "種類：" WHT "單手持用\n" NOR
        "無法使用的職業：\n" WHT
        "  德魯伊\n"
        "  牧師\n"
        "  法師\n" NOR
        "唯一能使用的人物：\n" WHT
        "  混亂陣營的人物\n" NOR;
}

mixed hit_ob(object me, object victim, int damage_bonus)
{
        int n;
	n = 3 + random(16);

        if (random(100) < 15 && living(victim))
	{
                victim->unconcious();
        	return HIR "霎時間只見$N" HIY "神聖長劍" HIR"劍芒暴"
                       "漲，$n" HIR "頓覺一陣昏眩。\n" NOR;
	} else
        if (random(100) < 50)
	{
	        victim->receive_wound("qi", n * 100, me);
	        victim->receive_wound("jing", n * 50, me);
        	return HIR "只見$N" HIY "神聖長劍" HIR"劍尖陡然噴射"
                       "出" + chinese_number(n) + "個火球，盡數擊在"
                       "$n" HIR "全身。\n" NOR;
	}
}

int do_cast(string arg)
{
        object me = this_player(), *obs;
        int n, i, flag, damage;

        if (! arg || arg == "")
                return notify_fail("你要施展什麽法術？\n");

        if (arg != "rage" && arg != "shield")
                return notify_fail("你無法施展此類法術。\n");

        if (arg == "rage")
        {
	        me->clean_up_enemy();
	        obs = me->query_enemy();

	        if (! me->is_fighting())
        	        return notify_fail("你只有在戰鬥中才能施展"
                                           RAGE "。\n");

	        if (me->is_busy())
        	        return notify_fail("你現在正在忙，沒有時間"
                                           "施法" RAGE "。\n");

	        message_vision(HIW "\n$N" HIW "施法" RAGEC + HIW "」"
                               "，高聲念誦道：比迪姆·亞特蒙·泰里"
                               "阿普·埃控。\n\n" NOR, me);
	        me->start_busy(5);

        	for (flag = 0, i = 0; i < sizeof(obs); i++)
        	{
                	if (random(10) > 3)
                	{
                                tell_object(obs[i], HIR "你只見眼前光芒"
                                                    "一閃，霎時間無數光"
                                                    "線便如鋼針般刺入體"
                                                    "内，幾欲窒息。\n" NOR);

                		damage = 1000 + random(3000);
                		obs[i]->receive_wound("qi", damage);
                        	obs[i]->receive_wound("jing", damage / 2, me);

	                        message("vision", HIY + obs[i]->name() +
                                                  HIY "只見眼前光芒一閃"
                                                  "，霎時間無數光線便如"
                                                  "鋼針般刺入體内，幾欲"
                                                  "窒息。\n\n" NOR,
                                                  environment(me),
                                                  ({ obs[i] }));
                        	flag = 1;
                	} else
                	{
                        	tell_object(obs[i], HIC "你法術豁免率檢定"
                                                    "成功，避開了" RAGEC +
                                                    HIC "」的攻擊。\n" NOR);
                	}
        	}
        	if (! flag) 
                	message_vision(HIC "然而沒有任何人受到$N" RAGEC +
                                       HIC "」的影响。\n" NOR, me, 0, obs);
	        return 1;
	}

        if (arg == "shield")
        {
        	if ((int)me->query_temp("shieldc"))
                	return notify_fail("你已經施展了" SHIELD "。\n");

	        n = 500;

	        message_vision(HIW "\n$N" HIW "施法" SHIELDC + HIW "」"
                               "，高聲念誦道：亞帝斯·索利·洛哈吾吉特"
                               "·莫拉薩拉。\n\n" NOR, me);

	        me->add_temp("apply/armor", n);
        	me->set_temp("shieldc", 1);

	        me->start_call_out((: call_other, __FILE__, "remove_effect",
                                      me, n :), n);

	        return 1;
	}
}

void remove_effect(object me, int n)
{
        if (me->query_temp("shieldc"))
       	{
               	me->add_temp("apply/armor", -n);
               	me->delete_temp("shieldc");
               	tell_object(me, "你的" SHIELD "施展完畢。\n");
       	}
}