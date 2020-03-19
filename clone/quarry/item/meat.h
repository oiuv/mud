// meat.h

void setup()
{
        set("only_do_effect", 1);
        set("base_weight", 300);
        ::setup();
}

int do_effect(object me)
{
        write("这块" + name() + "还是生的，烤熟了再吃吧。\n");
        return 1;
}

int broil(object me, object ob)
{
        object fob;

        me = this_player();

	if (me->is_busy())
	{
		write("你现在忙着呢，过会儿再烤吧。\n");
		return 1;
	}

        message_sort(HIM "$N" HIM "把" + name() + HIM "放在" + ob->name() +
                     HIM "上细细烤着，只听毕啵毕啵几声，闻得一阵诱人的香味"
                     "渐渐散了出来。$N见状连忙把烤好的" + name() + HIM "取"
                     "下。\n\n" NOR, me);

        fob = new("/clone/food/meat");
        fob->move(me, 1);

        add_amount(-1);

        if (query_amount() < 1)
                destruct(this_object());

	me->start_busy(1);
        return 1;
}
