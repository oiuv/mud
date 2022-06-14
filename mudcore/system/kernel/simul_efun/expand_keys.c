/*
 * @Author: 雪风@mud.ren
 * @Date: 2022-03-29 15:21:33
 * @LastEditTime: 2022-03-29 15:23:11
 * @LastEditors: 雪风
 * @Description: 展开映射：([({"a","b","c"}):1]) => (["a":1,"b":1,"c":1])
 *  https://bbs.mud.ren
 */
mapping expand_keys(mapping mp)
{
    mapping tmp = ([]);
    mixed key, val;

    foreach (key, val in mp)
    {
        if (arrayp(key))
        {
            string elem;

            foreach (elem in key)
                tmp[elem] = val;
        }
        else
            tmp[key] = val;
    }
    return tmp;
}
