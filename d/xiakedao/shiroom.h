// xiakedao 石室

int do_study(string arg)
{
        object me;
        int lvl;

        if (arg != "wall")
                return notify_fail("你想研究什么？\n");

        me = this_player();
        if (me->query("combat_exp") < 500000)
        {
                write("你看了半天，只恨自己实战经验太浅薄，无法领悟上面的高深知识。\n");
                return 1;
        }

        if (me->is_busy())
        {
                write("你现在正忙，没空研究上面的诗句。\n");
                return 1;
        }

        me->receive_damage("jing", 15);
        me->start_busy(1);

        lvl = me->query_skill("literate", 1);
        if (lvl >= 200)
                write("你看了半天，觉得这首诗写的很好，不过似乎没什么特别之处。\n");
        else
        if (lvl >= 100)
                write("你觉得这上面的诗大有寓意，不由的尽心苦思。\n");
        else
        if (lvl >= 1)
                write("你心中暗想：这定是前辈高手留下的秘籍，这些词句可要好好分析。\n");
        else
        if (random(2))
        {
                write("你望着上面的笔划，想起所修习的武功来，不禁渐渐有所体会。\n");
                if (me->query("experience") < me->query_experience_limit())
                        me->add("experience", 1);
        } else
                write("你潜心琢磨上面的笔划，全然没有想它是什么含义。\n");

	return 1;
}

void init()
{
        add_action("do_study", "think");
        add_action("do_study", "study");
}
