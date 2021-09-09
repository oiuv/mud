/*
 * @Author: 雪风@mud.ren
 * @Date: 2021-09-09 19:37:41
 * @LastEditTime: 2021-09-09 19:37:42
 * @LastEditors: 雪风
 * @Description: 食物公共接口
 *  https://bbs.mud.ren
 */
// food.c

#include <dbase.h>
#include <name.h>

mixed func = 0;

int is_food() { return 1; }

void apply_effect(function f)
{
    if (!func)
        func = f;
    else if (functionp(func))
        func = ({func, f});
    else if (sizeof(func) < 12)
        func += ({f});
}

void clear_effect()
{
    func = 0;
}

mixed query_effect()
{
    return func;
}

int do_effect(object me)
{
    int i;

    if (functionp(func))
        evaluate(func);
    if (arrayp(func))
        for (i = 0; i < sizeof(func); i++)
            evaluate(func[i]);
    return 1;
}
