#include <ansi.h>
#include <armor.h>

inherit WAIST;

void create()
{
        set_name(NOR + CYN "含沙射影" NOR, ({ "hansha sheying", "han", "sha", "hansha", "sheying" }) );
        set_weight(500);
        if (clonep())
                destruct(this_object());
        else {
                set("long", CYN "这是五毒教的奇门暗器「含沙射影」，样子象一条腰\n"
                                "带，可以束在腰间。带中间有一个扁扁的小铁盒，只\n"
                                "要在腰间一按(shot)就可以发射出细如牛毛的毒针。\n" NOR) ;
                set("unit", "个");
                set("value", 800000);
                set("no_sell", "乖乖，这…这不是何…教主的……");
                set("zhen", 10);
                set("material", "iron");
                set("armor_prop/armor", 3);
                set("stable", 100);
        }
        setup();
}

void init()
{
        add_action("do_shot", "shot");
}

int do_shot(string arg)
{
        object me, ob, target;
        int myskill, tgskill;
        int mylev, damage;
        string fam;

        me = this_player();

        if (environment(me)->query("no_fight"))
                return notify_fail ("这里不准战斗！\n");

        if (me->query_temp("armor/waist") != this_object())
                return notify_fail("你首先得将含沙射影装备在腰间。\n");

        if (! arg)
                return notify_fail("你想对谁发射含沙射影？\n");

        if (! objectp(target = present(arg, environment(me))))
                return notify_fail("这里没有这个人。\n");

        if (target->query("id") == me->query("id"))
                return notify_fail("你想杀自己吗？\n");

        if (! me->is_fighting(target))
                return notify_fail("你只能射杀战斗中的对手。\n");

        if (! target->is_character() || target->is_corpse())
                return notify_fail("看清楚一点，那并不是活物。\n");

        if (me->is_busy())
                return notify_fail("你正忙着哪。\n");

        if (this_object()->query("zhen") < 1)
                return notify_fail("铁盒中的毒针已经射光了。\n");

        if (! objectp(ob = present("hansha sheying", me)))
                return notify_fail("你没有这种东西。\n");

        myskill = me->query_skill("hansha-sheying", 1) + me->query_skill("dodge", 1);
        tgskill = target->query_skill("dodge");
        mylev = me->query_skill("hansha-sheying", 1);

        if (mylev <= 50)
                return notify_fail("你的含沙射影还不熟练，无法使用此物品！\n");

        this_object()->add("zhen", -1);
        message_vision(HIW "\n$N" HIW "一声轻笑，左手不经意的在腰间一按。只听"
                       "得一阵“嗤嗤嗤”的破空声。\n" NOR, me, target);
        me->start_busy(2 + random(2)) ;

        if (random(myskill) < tgskill)
	{
                message_vision(HIY "$n" HIY "大叫一声，猛的一个旱地拔葱身行"
                        "冲起数丈来高，躲开了$N" HIY "的毒针！\n\n" NOR,
                        me, target);
	} else
	{
                message_vision(HIR "$n" HIR "躲闪不及，被无数细如牛毛的毒针"
                               "打了一身，不由惨嚎连连！\n\n" NOR, me, target);

                target->affect_by("sha_poison",
                               ([ "level" : me->query("jiali") + random(me->query("jiali")),
                                  "id"    : me->query("id"),
                                  "duration" : mylev / 50 + random(mylev / 20) ]));

                tell_object (target, HIB "你只觉得脸上、胸前一痛，而后是奇"
                                     "痒难熬。\n" NOR);

                damage = mylev * 4 - (target->query("max_neili") / 10);
                if (damage < 100 ) damage = 100;
                if (damage > 800 ) damage = 800;
                target->receive_wound("qi", damage) ; 
                target->start_busy(4);
        }

        if (! target->is_killing(me))
		target->kill_ob(me);

        return 1;
}
